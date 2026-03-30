import { useState, useEffect } from 'react';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import './SettlementDetails.css';

function formatAmount(n) {
  if (n == null || n === undefined) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatWeekRange(startIso, endIso) {
  if (!startIso || !endIso) return '—';
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return `${start.toLocaleDateString('en-IN', opts)} – ${end.toLocaleDateString('en-IN', opts)}`;
}

/** Extract weekly profit object from API response (envelope or raw). */
function extractWeeklyProfit(res) {
  if (!res) return null;
  if (res.success === true && res.data && typeof res.data === 'object') {
    const d = res.data;
    if (d.weekStartDate != null || d.netAmount != null) return d;
  }
  if (res.weekStartDate != null || res.netAmount != null) return res;
  return null;
}

export default function SettlementDetails() {
  const [profit, setProfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    ApiCallGet(ApiConfig.subAdminWeeklyProfit, {
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    })
      .then((res) => {
        if (cancelled) return;
        const row = extractWeeklyProfit(res);
        if (!row) {
          if (res?.success === false) {
            setError(res?.message || 'Failed to load weekly profit.');
          } else {
            setError('No weekly profit data returned.');
          }
          setProfit(null);
          return;
        }
        setError('');
        setProfit(row);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load weekly profit.');
          setProfit(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="settlement-details-page settlement-premium">
      <header className="settlement-page-header">
        <div className="settlement-header-content">
          <span className="settlement-header-icon" aria-hidden>◇</span>
          <div>
            <h1 className="settlement-title">Settlement Details</h1>
            <p className="settlement-subtitle">
              Current week deposits, withdrawals, and profit split (master vs your share)
            </p>
          </div>
        </div>
      </header>

      {loading && (
        <div className="settlement-loading-state">
          <span className="settlement-loading-spinner" />
          <p className="settlement-loading">Loading weekly profit…</p>
        </div>
      )}
      {error && <p className="settlement-error">{error}</p>}

      {!loading && profit && (
        <>
          <div className="weekly-profit-week-banner">
            <span className="weekly-profit-week-label">Week</span>
            <span className="weekly-profit-week-value">
              {formatWeekRange(profit.weekStartDate, profit.weekEndDate)}
            </span>
          </div>

          <div className="weekly-profit-grid">
            <div className="weekly-profit-stat">
              <span className="weekly-profit-stat-label">Total deposits</span>
              <span className="weekly-profit-stat-value">{formatAmount(profit.totalDeposit)}</span>
            </div>
            <div className="weekly-profit-stat">
              <span className="weekly-profit-stat-label">Total withdrawals</span>
              <span className="weekly-profit-stat-value">{formatAmount(profit.totalWithdrawal)}</span>
            </div>
            <div className="weekly-profit-stat weekly-profit-stat-highlight">
              <span className="weekly-profit-stat-label">Net amount</span>
              <span className="weekly-profit-stat-value">{formatAmount(profit.netAmount)}</span>
            </div>
            <div className="weekly-profit-stat">
              <span className="weekly-profit-stat-label">Master share</span>
              <span className="weekly-profit-stat-value weekly-profit-stat-master">
                {formatAmount(profit.masterShare)}
              </span>
            </div>
            <div className="weekly-profit-stat">
              <span className="weekly-profit-stat-label">Your share</span>
              <span className="weekly-profit-stat-value weekly-profit-stat-yours">
                {formatAmount(profit.subAdminShare)}
              </span>
            </div>
            <div className="weekly-profit-stat">
              <span className="weekly-profit-stat-label">Commission sharing</span>
              <span className="weekly-profit-stat-value">
                {profit.commissionSharing != null
                  ? `${Number(profit.commissionSharing)}%`
                  : '—'}
              </span>
            </div>
          </div>

          <div className="weekly-profit-meta">
            {profit.subAdminId && (
              <div className="weekly-profit-meta-row">
                <span className="weekly-profit-meta-key">Sub-admin ID</span>
                <span className="weekly-profit-meta-val" title={profit.subAdminId}>
                  {profit.subAdminId}
                </span>
              </div>
            )}
            <div className="weekly-profit-meta-row">
              <span className="weekly-profit-meta-key">Last synced</span>
              <span className="weekly-profit-meta-val">{formatDateTime(profit.lastSyncedAt)}</span>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !profit && (
        <div className="settlement-datatable-card">
          <p className="settlement-empty-cell" style={{ margin: 0, border: 'none' }}>
            No weekly profit data available.
          </p>
        </div>
      )}
    </div>
  );
}
