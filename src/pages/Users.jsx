import { useState, useMemo } from 'react';
import Modal from '../components/Modal';
import { useToast } from '../context/ToastContext';
import './Users.css';

const initialUsers = [
  { id: 1, name: 'Raju Kumar', username: 'raju_agent', mobile: '98765 43210', status: 'active', balance: 12500, joined: '10 Jan 2025' },
  { id: 2, name: 'Suresh Singh', username: 'suresh_agent', mobile: '98765 43211', status: 'active', balance: 8200, joined: '15 Jan 2025' },
  { id: 3, name: 'Vijay Sharma', username: 'vijay_agent', mobile: '98765 43212', status: 'inactive', balance: 0, joined: '20 Dec 2024' },
  { id: 4, name: 'Amit Patel', username: 'amit_agent', mobile: '98765 43213', status: 'active', balance: 18900, joined: '5 Feb 2025' },
];

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const { showToast } = useToast();

  const [addForm, setAddForm] = useState({ name: '', username: '', mobile: '', creditLimit: '' });

  const filtered = useMemo(() => {
    let list = filter === 'all' ? users : users.filter((u) => u.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.mobile.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
      );
    }
    return list;
  }, [users, filter, search]);

  const handleAddAgent = (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.username.trim() || !addForm.mobile.trim()) {
      showToast('Please fill name, username and mobile', 'error');
      return;
    }
    if (users.some((u) => u.username === addForm.username.trim())) {
      showToast('Username already exists', 'error');
      return;
    }
    const name = addForm.name.trim();
    const newId = Math.max(...users.map((u) => u.id), 0) + 1;
    const joined = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    setUsers((prev) => [
      ...prev,
      {
        id: newId,
        name,
        username: addForm.username.trim(),
        mobile: addForm.mobile.trim(),
        status: 'active',
        balance: 0,
        joined,
      },
    ]);
    setAddForm({ name: '', username: '', mobile: '', creditLimit: '' });
    setShowAddAgent(false);
    showToast(`Agent "${name}" added successfully`, 'success');
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>Users / Agents</h1>
        <p>Agents under your subadmin panel</p>
      </header>
      <div className="toolbar">
        <div className="filter-tabs">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              type="button"
              className={filter === f ? 'tab active' : 'tab'}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search by name, username, mobile..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => setShowAddAgent(true)}>
          + Add Agent
        </button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Balance (₹)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-cell">No agents found</td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>{u.mobile}</td>
                  <td>
                    <span className={`badge ${u.status}`}>{u.status}</span>
                  </td>
                  <td>{u.balance.toLocaleString('en-IN')}</td>
                  <td>
                    <button type="button" className="btn-sm" onClick={() => setViewUser(u)}>
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {viewUser && (
        <Modal title="Agent Details" onClose={() => setViewUser(null)}>
          <div className="detail-row"><strong>Name</strong><span>{viewUser.name}</span></div>
          <div className="detail-row"><strong>Username</strong><span>{viewUser.username}</span></div>
          <div className="detail-row"><strong>Mobile</strong><span>{viewUser.mobile}</span></div>
          <div className="detail-row"><strong>Status</strong><span className={`badge ${viewUser.status}`}>{viewUser.status}</span></div>
          <div className="detail-row"><strong>Balance (₹)</strong><span>{viewUser.balance.toLocaleString('en-IN')}</span></div>
          <div className="detail-row"><strong>Joined</strong><span>{viewUser.joined || '—'}</span></div>
        </Modal>
      )}

      {showAddAgent && (
        <Modal title="Add Agent" onClose={() => setShowAddAgent(false)}>
          <form onSubmit={handleAddAgent} className="profile-form">
            <label>
              Full Name *
              <input type="text" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Raju Kumar" required />
            </label>
            <label>
              Username *
              <input type="text" value={addForm.username} onChange={(e) => setAddForm((f) => ({ ...f, username: e.target.value }))} placeholder="e.g. raju_agent" required />
            </label>
            <label>
              Mobile *
              <input type="text" value={addForm.mobile} onChange={(e) => setAddForm((f) => ({ ...f, mobile: e.target.value }))} placeholder="e.g. 98765 43210" required />
            </label>
            <label>
              Credit Limit (₹) <span className="muted">optional</span>
              <input type="number" value={addForm.creditLimit} onChange={(e) => setAddForm((f) => ({ ...f, creditLimit: e.target.value }))} placeholder="0" min="0" />
            </label>
            <div className="form-actions">
              <button type="button" className="btn-sm" onClick={() => setShowAddAgent(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Add Agent</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
