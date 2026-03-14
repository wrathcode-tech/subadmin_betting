import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Users.css';

const mockWithdrawals = [
  { id: 'W201', user: 'Raju Kumar', amount: 3000, method: 'Bank', status: 'pending', date: '14 Mar 2025, 10:45' },
  { id: 'W202', user: 'Suresh Singh', amount: 5000, method: 'UPI', status: 'approved', date: '14 Mar 2025, 09:30' },
  { id: 'W203', user: 'Amit Patel', amount: 2000, method: 'Bank', status: 'pending', date: '14 Mar 2025, 11:20' },
  { id: 'W204', user: 'Raju Kumar', amount: 4000, method: 'Bank', status: 'rejected', date: '13 Mar 2025, 14:00' },
];

export default function Withdrawals() {
  const [searchParams] = useSearchParams();
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();
  useEffect(() => {
    const f = searchParams.get('filter');
    if (f && ['all', 'pending', 'approved', 'rejected'].includes(f)) setStatusFilter(f);
  }, [searchParams]);

  const updateStatus = (id, newStatus, item) => {
    if (newStatus === 'approved' && !window.confirm(`Approve withdrawal #${id} of ₹${item.amount.toLocaleString('en-IN')} to ${item.user}?`)) return;
    if (newStatus === 'rejected' && !window.confirm(`Reject withdrawal #${id} of ₹${item.amount.toLocaleString('en-IN')} for ${item.user}?`)) return;
    setWithdrawals((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    showToast(newStatus === 'approved' ? `Withdrawal #${id} approved` : `Withdrawal #${id} rejected`, newStatus === 'approved' ? 'success' : 'info');
  };

  const list = statusFilter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === statusFilter);

  return (
    <div className="withdrawals-page">
      <header className="page-header">
        <h1>Withdrawals</h1>
        <p>Manage withdrawal requests of your agents</p>
      </header>

      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              type="button"
              className={statusFilter === f ? 'tab active' : 'tab'}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Amount (₹)</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((w) => (
              <tr key={w.id}>
                <td>#{w.id}</td>
                <td>{w.user}</td>
                <td>{w.amount.toLocaleString('en-IN')}</td>
                <td>{w.method}</td>
                <td><span className={`badge ${w.status}`}>{w.status}</span></td>
                <td className="muted">{w.date}</td>
                <td>
                  {w.status === 'pending' ? (
                    <span className="action-btns">
                      <button type="button" className="btn-sm btn-approve" onClick={() => updateStatus(w.id, 'approved', w)}>Approve</button>
                      <button type="button" className="btn-sm btn-reject" onClick={() => updateStatus(w.id, 'rejected', w)}>Reject</button>
                    </span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
