import { useState, useEffect } from 'react';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import './SettlementDetails.css';

function formatAmount(n) {
  if (n == null || n === undefined) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatWeekLabel(period) {
  if (!period?.startDate || !period?.endDate) return '—';
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return `Week of ${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', opts)}`;
}

function normalizeSettlement(s) {
  const period = s.period || {};
  return {
    id: s._id,
    weekLabel: formatWeekLabel(period),
    netProfit: s.profit,
    yourShare: s.subAdminProfit,
    adminShare: s.adminProfit,
    status: s.status || 'pending',
    settledAt: s.updatedAt || s.createdAt,
    deposit: s.deposit,
    withdrawal: s.withdrawal,
    commissionSharing: s.commissionSharing,
  };
}

export default function SettlementDetails() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    const url = ApiConfig.subAdminWeeklySettlement;
    ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' })
      .then((res) => {
        if (cancelled) return;
        if (!res?.success) {
          setError(res?.message || 'Failed to load settlement');
          setList([]);
          return;
        }
        setError('');
        const raw = res.data;
        let items = [];
        if (Array.isArray(raw)) {
          items = raw.map(normalizeSettlement);
        } else if (raw?.settlements && Array.isArray(raw.settlements)) {
          items = raw.settlements.map(normalizeSettlement);
        } else if (raw && typeof raw === 'object' && raw._id) {
          items = [normalizeSettlement(raw)];
        }
        setList(items);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load settlement');
          setList([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="settlement-details-page settlement-premium">
      <header className="settlement-page-header">
        <div className="settlement-header-content">
          <span className="settlement-header-icon" aria-hidden>◇</span>
          <div>
            <h1 className="settlement-title">Settlement Details</h1>
            <p className="settlement-subtitle">History of profit sharing with admin on a weekly basis</p>
          </div>
        </div>
      </header>

      {loading && (
        <div className="settlement-loading-state">
          <span className="settlement-loading-spinner" />
          <p className="settlement-loading">Loading settlement…</p>
        </div>
      )}
      {error && <p className="settlement-error">{error}</p>}

      {!loading && (
        <div className="settlement-datatable-card">
          <div className="settlement-datatable-header">
            <span className="settlement-datatable-title">Weekly settlements</span>
            {list.length > 0 && (
              <span className="settlement-datatable-count">{list.length} record{list.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          <div className="settlement-table-wrap">
            <table className="settlement-datatable" role="grid">
              <thead>
                <tr>
                  <th scope="col">Week</th>
                  <th scope="col">Net profit</th>
                  <th scope="col">Your share</th>
                  <th scope="col">Admin share</th>
                  <th scope="col">Status</th>
                  <th scope="col">Settled on</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="settlement-empty-cell">
                      <span className="settlement-empty-icon">—</span>
                      No settlement records yet
                    </td>
                  </tr>
                ) : (
                  list.map((row, index) => (
                    <tr key={row.id} className={index % 2 === 1 ? 'settlement-row-alt' : ''}>
                      <td className="settlement-cell-week">{row.weekLabel}</td>
                      <td className="settlement-cell-amount">{formatAmount(row.netProfit)}</td>
                      <td className="settlement-cell-amount settlement-cell-your">{formatAmount(row.yourShare)}</td>
                      <td className="settlement-cell-amount settlement-cell-admin">{formatAmount(row.adminShare)}</td>
                      <td>
                        <span className={`settlement-badge settlement-badge-${row.status}`}>{row.status}</span>
                      </td>
                      <td className="settlement-cell-date">{formatDate(row.settledAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
