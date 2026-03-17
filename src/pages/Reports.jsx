import { useState, useEffect, useMemo } from 'react';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import './Users.css';
import './Reports.css';

const APPROVED_TX_LIMIT = 500;

function formatAmount(n) {
  if (n == null || n === undefined) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isToday(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
}

function isLast7Days(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);
  return d >= weekAgo;
}

function normalizeApprovedDeposit(d) {
  const user = d.userId;
  return {
    id: d._id,
    type: 'deposit',
    transactionId: d.transactionId || d._id,
    userName: user?.fullName || user?.email || '—',
    amount: d.amount,
    createdAt: d.createdAt,
    createdAtFormatted: formatDate(d.createdAt),
  };
}

function normalizeApprovedWithdrawal(w) {
  const user = w.userId;
  return {
    id: w._id,
    type: 'withdrawal',
    transactionId: w.transactionId || w._id,
    userName: user?.fullName || user?.email || '—',
    amount: w.amount,
    createdAt: w.createdAt,
    createdAtFormatted: formatDate(w.createdAt),
  };
}

export default function Reports() {
  const [range, setRange] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [approvedDeposits, setApprovedDeposits] = useState([]);
  const [approvedWithdrawals, setApprovedWithdrawals] = useState([]);
  const [loadingDw, setLoadingDw] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    ApiCallGet(ApiConfig.subAdminCollectionPayoutProfitloss, { Authorization: token ? `Bearer ${token}` : '' })
      .then((res) => {
        if (cancelled) return;
        if (res?.success === true && res?.data) {
          setData(res.data);
          setError('');
        } else {
          setError(res?.message || 'Failed to load reports');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load reports');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    const headers = { Authorization: token ? `Bearer ${token}` : '' };
    setLoadingDw(true);
    const url = `${ApiConfig.subAdminApprovedTransactions}?page=1&limit=${APPROVED_TX_LIMIT}`;
    ApiCallGet(url, headers)
      .then((res) => {
        if (cancelled) return;
        if (res?.success !== true || !res?.data) {
          setApprovedDeposits([]);
          setApprovedWithdrawals([]);
          return;
        }
        const deposits = (res.data.approvedDeposits || []).map(normalizeApprovedDeposit);
        const withdrawals = (res.data.approvedWithdrawals || []).map(normalizeApprovedWithdrawal);
        setApprovedDeposits(deposits);
        setApprovedWithdrawals(withdrawals);
      })
      .catch(() => {
        if (!cancelled) {
          setApprovedDeposits([]);
          setApprovedWithdrawals([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingDw(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filterByDate = (item) => (range === 'today' ? isToday(item.createdAt) : isLast7Days(item.createdAt));

  const depositsInRange = useMemo(() => approvedDeposits.filter(filterByDate), [approvedDeposits, range]);
  const withdrawalsInRange = useMemo(() => approvedWithdrawals.filter(filterByDate), [approvedWithdrawals, range]);

  const depositTotal = useMemo(() => depositsInRange.reduce((s, d) => s + Number(d.amount || 0), 0), [depositsInRange]);
  const withdrawalTotal = useMemo(() => withdrawalsInRange.reduce((s, w) => s + Number(w.amount || 0), 0), [withdrawalsInRange]);

  const combinedList = useMemo(() => {
    const list = [
      ...depositsInRange.map((d) => ({ ...d, sortAt: new Date(d.createdAt).getTime() })),
      ...withdrawalsInRange.map((w) => ({ ...w, sortAt: new Date(w.createdAt).getTime() })),
    ];
    list.sort((a, b) => b.sortAt - a.sortAt);
    return list;
  }, [depositsInRange, withdrawalsInRange]);

  const report = data ? (range === 'today' ? data.today : data.week) : null;
  const collection = report?.collection ?? null;
  const payout = report?.payout ?? null;
  const profitloss = report?.profitloss ?? null;

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Collection, payout and profit summary</p>
      </header>
      <div className="reports-toolbar">
        {['today', 'week'].map((r) => (
          <button
            key={r}
            type="button"
            className={range === r ? 'tab active' : 'tab'}
            onClick={() => setRange(r)}
          >
            {r === 'today' ? 'Today' : 'This Week'}
          </button>
        ))}
      </div>
      {loading && <p className="reports-loading">Loading reports…</p>}
      {error && <p className="reports-error">{error}</p>}
      <div className="reports-summary">
        <div className="report-card">
          <span className="report-label">Collection (₹)</span>
          <span className="report-value green">{loading || !data ? '—' : formatAmount(collection)}</span>
        </div>
        <div className="report-card">
          <span className="report-label">Payout (₹)</span>
          <span className="report-value red">{loading || !data ? '—' : formatAmount(payout)}</span>
        </div>
        <div className="report-card">
          <span className="report-label">Profit / P&L (₹)</span>
          <span className={`report-value ${profitloss != null ? (profitloss >= 0 ? 'green' : 'red') : ''}`}>
            {loading || !data ? '—' : formatAmount(profitloss)}
          </span>
        </div>
      </div>

      <section className="report-section">
        <h2>Approved deposits & withdrawals</h2>
        {loadingDw ? (
          <p className="reports-loading">Loading approved deposits and withdrawals…</p>
        ) : (
          <>
            <div className="reports-summary reports-dw-summary">
              <div className="report-card">
                <span className="report-label">Approved deposits ({range === 'today' ? 'Today' : 'This week'})</span>
                <span className="report-value green">{formatAmount(depositTotal)}</span>
                <span className="report-meta">{depositsInRange.length} request{depositsInRange.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="report-card">
                <span className="report-label">Approved withdrawals ({range === 'today' ? 'Today' : 'This week'})</span>
                <span className="report-value red">{formatAmount(withdrawalTotal)}</span>
                <span className="report-meta">{withdrawalsInRange.length} request{withdrawalsInRange.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Ref</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {combinedList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="empty-cell">No approved deposits or withdrawals in this period</td>
                    </tr>
                  ) : (
                    combinedList.map((row) => (
                      <tr key={`${row.type}-${row.id}`}>
                        <td><span className={`badge badge-${row.type}`}>{row.type}</span></td>
                        <td>{row.userName}</td>
                        <td className={row.type === 'deposit' ? 'green' : 'red'}>₹{Number(row.amount).toLocaleString('en-IN')}</td>
                        <td className="muted">{row.transactionId}</td>
                        <td className="muted">{row.createdAtFormatted}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
