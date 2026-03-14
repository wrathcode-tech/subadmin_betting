import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import './Users.css';

const mockDeposits = [
  { id: 'D101', user: 'Raju Kumar', amount: 5000, method: 'UPI', status: 'pending', date: '14 Mar 2025, 10:30' },
  { id: 'D102', user: 'Suresh Singh', amount: 10000, method: 'Bank', status: 'approved', date: '14 Mar 2025, 09:15' },
  { id: 'D103', user: 'Amit Patel', amount: 2500, method: 'UPI', status: 'pending', date: '14 Mar 2025, 11:00' },
  { id: 'D104', user: 'Vijay Sharma', amount: 7500, method: 'Bank', status: 'rejected', date: '13 Mar 2025, 16:45' },
];

export default function Deposits() {
  const [searchParams] = useSearchParams();
  const [deposits, setDeposits] = useState(mockDeposits);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showToast } = useToast();
  useEffect(() => {
    const f = searchParams.get('filter');
    if (f && ['all', 'pending', 'approved', 'rejected'].includes(f)) setStatusFilter(f);
  }, [searchParams]);

  const updateStatus = (id, newStatus, item) => {
    if (newStatus === 'approved' && !window.confirm(`Approve deposit #${id} of ₹${item.amount.toLocaleString('en-IN')} by ${item.user}?`)) return;
    if (newStatus === 'rejected' && !window.confirm(`Reject deposit #${id} of ₹${item.amount.toLocaleString('en-IN')} by ${item.user}?`)) return;
    setDeposits((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    showToast(newStatus === 'approved' ? `Deposit #${id} approved` : `Deposit #${id} rejected`, newStatus === 'approved' ? 'success' : 'info');
  };

  const list = statusFilter === 'all' ? deposits : deposits.filter((d) => d.status === statusFilter);

  return (
    <div className="deposits-page">
      <header className="page-header">
        <h1>Deposits</h1>
        <p>Manage deposit requests of your agents</p>
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
            {list.map((d) => (
              <tr key={d.id}>
                <td>#{d.id}</td>
                <td>{d.user}</td>
                <td>{d.amount.toLocaleString('en-IN')}</td>
                <td>{d.method}</td>
                <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                <td className="muted">{d.date}</td>
                <td>
                  {d.status === 'pending' ? (
                    <span className="action-btns">
                      <button type="button" className="btn-sm btn-approve" onClick={() => updateStatus(d.id, 'approved', d)}>Approve</button>
                      <button type="button" className="btn-sm btn-reject" onClick={() => updateStatus(d.id, 'rejected', d)}>Reject</button>
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
