import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const stats = [
  { label: 'Total Agents', value: 12, icon: '👥', color: '#38bdf8' },
  { label: 'Active Bets Today', value: 156, icon: '🎲', color: '#34d399' },
  { label: 'Collection Today (₹)', value: '42,500', icon: '💰', color: '#fbbf24' },
  { label: 'Payout Today (₹)', value: '28,100', icon: '📤', color: '#f87171' },
];

const pendingDeposits = 2;
const pendingWithdrawals = 2;

export default function Dashboard() {
  const { subadmin } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {subadmin?.name}</h1>
        <p>Subadmin dashboard – overview of your agents and bets</p>
      </header>
      {(pendingDeposits > 0 || pendingWithdrawals > 0) && (
        <div className="dashboard-alerts">
          {pendingDeposits > 0 && (
            <Link to="/deposits?filter=pending" className="alert-card alert-warning">
              <span className="alert-icon">💰</span>
              <span><strong>{pendingDeposits}</strong> pending deposit(s)</span>
              <span className="alert-arrow">→</span>
            </Link>
          )}
          {pendingWithdrawals > 0 && (
            <Link to="/withdrawals?filter=pending" className="alert-card alert-info">
              <span className="alert-icon">📤</span>
              <span><strong>{pendingWithdrawals}</strong> pending withdrawal(s)</span>
              <span className="alert-arrow">→</span>
            </Link>
          )}
        </div>
      )}
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
      <div className="dashboard-quicklinks">
        <Link to="/users" className="quicklink">Manage Agents</Link>
        <Link to="/bets" className="quicklink">View Bets</Link>
        <Link to="/reports" className="quicklink">Reports</Link>
        <Link to="/games" className="quicklink">Games</Link>
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
