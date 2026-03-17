import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import './Dashboard.css';

function formatAmount(n) {
  if (n == null || n === undefined) return '—';
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

export default function Dashboard() {
  const { subadmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    ApiCallGet(ApiConfig.subAdminDashboard, { Authorization: token ? `Bearer ${token}` : '' })
      .then((res) => {
        if (cancelled) return;
        if (res?.success === true && res?.data) {
          setData(res.data);
          setError('');
        } else {
          setError(res?.message || 'Failed to load dashboard');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = data
    ? [
        { label: 'Pending Deposits', value: data.pendingDepositCount ?? '—', icon: '⏳', color: '#f59e0b', isCount: true },
        { label: 'Total Approved Deposits', value: formatAmount(data.totalApprovedDeposits), icon: '💰', color: '#38bdf8' },
        { label: 'Deposits Today', value: formatAmount(data.totalDepositsToday), icon: '📥', color: '#34d399' },
        { label: 'Deposits (7 days)', value: formatAmount(data.totalDeposits7Days), icon: '📊', color: '#34d399' },
        { label: 'Deposits (30 days)', value: formatAmount(data.totalDeposits30Days), icon: '📈', color: '#38bdf8' },
        { label: 'Pending Withdrawals', value: data.pendingWithdrawalCount ?? '—', icon: '⏳', color: '#f59e0b', isCount: true },
        { label: 'Total Withdrawals', value: formatAmount(data.totalWithdrawals), icon: '💸', color: '#38bdf8' },
        { label: 'Withdrawals Today', value: formatAmount(data.totalWithdrawalsToday), icon: '📤', color: '#34d399' },
        { label: 'Withdrawals (7 days)', value: formatAmount(data.totalWithdrawals7Days), icon: '📊', color: '#34d399' },
        { label: 'Withdrawals (30 days)', value: formatAmount(data.totalWithdrawals30Days), icon: '📈', color: '#38bdf8' },
      ]
    : [];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {subadmin?.name}</h1>
        <p>Subadmin dashboard – overview of your agents and bets</p>
      </header>
      {loading && <p className="dashboard-loading">Loading dashboard…</p>}
      {error && <p className="dashboard-error">{error}</p>}
      <div className="stats-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ '--accent': s.color }}>
            <span className="stat-icon">{s.icon}</span>
            <div className="stat-content">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
     
      <section className="recent-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-dot success" />
            <span>Agent &quot;Raju&quot; placed bet #1023 – Cricket – ₹500</span>
            <span className="activity-time">2 min ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-dot info" />
            <span>Agent &quot;Suresh&quot; settled 5 bets – net +₹1,200</span>
            <span className="activity-time">15 min ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-dot warning" />
            <span>New agent &quot;Vijay&quot; added under your panel</span>
            <span className="activity-time">1 hr ago</span>
          </div>
        </div>
      </section>
    </div>
  );
}
