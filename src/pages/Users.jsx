import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import './Users.css';

const LIMIT = 20;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState('all');
  const [viewUser, setViewUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (search.trim()) params.set('search', search.trim());
    const url = `${ApiConfig.subAdminUsers}?${params.toString()}`;
    const response = await ApiCallGet(url, {
      Authorization: token ? `Bearer ${token}` : '',
    });
    setLoading(false);

    if (!response) {
      setError('Network error. Please try again.');
      setUsers([]);
      return;
    }
    if (response.success !== true) {
      setError(response.message || 'Failed to load users.');
      setUsers([]);
      return;
    }
    const data = response.data;
    setUsers(data?.users ?? []);
    setPagination({
      page: data?.pagination?.page ?? 1,
      limit: data?.pagination?.limit ?? LIMIT,
      total: data?.pagination?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 0,
    });
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const filtered = filter === 'all'
    ? users
    : users.filter((u) => {
        const status = (u.accountStatus || '').toLowerCase();
        const active = u.isActive === true || status === 'active';
        if (filter === 'active') return active;
        if (filter === 'inactive') return !active;
        return true;
      });

  const statusBadge = (u) => {
    const status = (u.accountStatus || (u.isActive ? 'active' : 'inactive')).toLowerCase();
    return status;
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>Users / Agents</h1>
        <p>Users under your subadmin panel</p>
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
        <form onSubmit={handleSearchSubmit} className="search-form" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search by name, username..."
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>
      {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      <div className="table-wrap">
        {loading ? (
          <div className="empty-cell">Loading users…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>UUID</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-cell">No users found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullName || '—'}</td>
                    <td>{u.username || '—'}</td>
                    <td>{u.uuid || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(u)}`}>
                        {(u.accountStatus || (u.isActive ? 'active' : 'inactive')).toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
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
        )}
      </div>
      {!loading && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            type="button"
            className="btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {viewUser && (
        <Modal title="User Details" onClose={() => setViewUser(null)}>
          <div className="detail-row"><strong>Name</strong><span>{viewUser.fullName || '—'}</span></div>
          <div className="detail-row"><strong>Username</strong><span>{viewUser.username || '—'}</span></div>
          <div className="detail-row"><strong>UUID</strong><span>{viewUser.uuid || '—'}</span></div>
          <div className="detail-row"><strong>Status</strong><span className={`badge ${statusBadge(viewUser)}`}>{(viewUser.accountStatus || (viewUser.isActive ? 'active' : 'inactive')).toLowerCase()}</span></div>
          <div className="detail-row"><strong>Joined</strong><span>{formatDate(viewUser.createdAt)}</span></div>
          <div className="detail-row"><strong>Updated</strong><span>{formatDate(viewUser.updatedAt)}</span></div>
        </Modal>
      )}
    </div>
  );
}
