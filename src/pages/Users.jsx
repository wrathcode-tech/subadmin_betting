import { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import './Users.css';

const LIMIT = 20;

const emptyPagination = () => ({
  page: 1,
  limit: LIMIT,
  total: 0,
  totalPages: 0,
});

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const authHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

export default function Users() {
  const [listTab, setListTab] = useState('assigned'); // 'assigned' | 'referred'

  const [assignedUsers, setAssignedUsers] = useState([]);
  const [assignedLoading, setAssignedLoading] = useState(true);
  const [assignedError, setAssignedError] = useState('');
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedSearch, setAssignedSearch] = useState('');
  const [assignedSearchInput, setAssignedSearchInput] = useState('');
  const [assignedPagination, setAssignedPagination] = useState(emptyPagination);

  const [referredUsers, setReferredUsers] = useState([]);
  const [referredLoading, setReferredLoading] = useState(true);
  const [referredError, setReferredError] = useState('');
  const [referredPage, setReferredPage] = useState(1);
  const [referredSearch, setReferredSearch] = useState('');
  const [referredSearchInput, setReferredSearchInput] = useState('');
  const [referredPagination, setReferredPagination] = useState(emptyPagination);

  const [filter, setFilter] = useState('all');
  const [viewUser, setViewUser] = useState(null);
  const [viewSource, setViewSource] = useState('assigned');

  const fetchAssigned = useCallback(async () => {
    setAssignedLoading(true);
    setAssignedError('');
    const params = new URLSearchParams({ page: String(assignedPage), limit: String(LIMIT) });
    if (assignedSearch.trim()) params.set('search', assignedSearch.trim());
    const url = `${ApiConfig.subAdminUsers}?${params.toString()}`;
    const response = await ApiCallGet(url, authHeaders());
    setAssignedLoading(false);

    if (!response) {
      setAssignedError('Network error. Please try again.');
      setAssignedUsers([]);
      return;
    }
    if (response.success !== true) {
      setAssignedError(response.message || 'Failed to load assigned users.');
      setAssignedUsers([]);
      return;
    }
    const data = response.data;
    setAssignedUsers(data?.users ?? []);
    setAssignedPagination({
      page: data?.pagination?.page ?? 1,
      limit: data?.pagination?.limit ?? LIMIT,
      total: data?.pagination?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 0,
    });
  }, [assignedPage, assignedSearch]);

  const fetchReferred = useCallback(async () => {
    setReferredLoading(true);
    setReferredError('');
    const params = new URLSearchParams({ page: String(referredPage), limit: String(LIMIT) });
    if (referredSearch.trim()) params.set('search', referredSearch.trim());
    const url = `${ApiConfig.subAdminReferredUsers}?${params.toString()}`;
    const response = await ApiCallGet(url, authHeaders());
    setReferredLoading(false);

    if (!response) {
      setReferredError('Network error. Please try again.');
      setReferredUsers([]);
      return;
    }
    if (response.success !== true) {
      setReferredError(response.message || 'Failed to load referred users.');
      setReferredUsers([]);
      return;
    }
    const data = response.data;
    setReferredUsers(data?.users ?? []);
    setReferredPagination({
      page: data?.pagination?.page ?? 1,
      limit: data?.pagination?.limit ?? LIMIT,
      total: data?.pagination?.total ?? 0,
      totalPages: data?.pagination?.totalPages ?? 0,
    });
  }, [referredPage, referredSearch]);

  useEffect(() => {
    if (listTab !== 'assigned') return;
    fetchAssigned();
  }, [listTab, fetchAssigned]);

  useEffect(() => {
    if (listTab !== 'referred') return;
    fetchReferred();
  }, [listTab, fetchReferred]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (listTab === 'assigned') {
      setAssignedSearch(assignedSearchInput.trim());
      setAssignedPage(1);
    } else {
      setReferredSearch(referredSearchInput.trim());
      setReferredPage(1);
    }
  };

  const users = listTab === 'assigned' ? assignedUsers : referredUsers;
  const loading = listTab === 'assigned' ? assignedLoading : referredLoading;
  const error = listTab === 'assigned' ? assignedError : referredError;
  const pagination = listTab === 'assigned' ? assignedPagination : referredPagination;
  const page = listTab === 'assigned' ? assignedPage : referredPage;
  const setPage = listTab === 'assigned' ? setAssignedPage : setReferredPage;

  const searchInput = listTab === 'assigned' ? assignedSearchInput : referredSearchInput;
  const setSearchInput = listTab === 'assigned' ? setAssignedSearchInput : setReferredSearchInput;

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

  const openView = (u, source) => {
    setViewUser(u);
    setViewSource(source);
  };

  const switchTab = (tab) => {
    setListTab(tab);
    setFilter('all');
  };

  return (
    <div className="users-page">
      <header className="page-header">
        <h1>Users</h1>
        <p>Users under your branch and users who joined via your referral code</p>
      </header>

      <div className="users-list-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={listTab === 'assigned'}
          className={listTab === 'assigned' ? 'users-main-tab active' : 'users-main-tab'}
          onClick={() => switchTab('assigned')}
        >
          Assigned users
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={listTab === 'referred'}
          className={listTab === 'referred' ? 'users-main-tab active' : 'users-main-tab'}
          onClick={() => switchTab('referred')}
        >
          Referred users
        </button>
      </div>

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
            placeholder={listTab === 'assigned' ? 'Search name, username…' : 'Search name, username, email…'}
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
          <div className="empty-cell">
            {listTab === 'assigned' ? 'Loading assigned users…' : 'Loading referred users…'}
          </div>
        ) : listTab === 'assigned' ? (
          <table className="data-table">
            <thead>
              <tr>
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
                  <td colSpan={5} className="empty-cell">No assigned users found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.username || '—'}</td>
                    <td>{u.uuid || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(u)}`}>
                        {(u.accountStatus || (u.isActive ? 'active' : 'inactive')).toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openView(u, 'assigned')}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>UUID</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-cell">No referred users found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullName || '—'}</td>
                    <td>{u.username || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td>{u.mobileMasked || '—'}</td>
                    <td>{u.uuid || '—'}</td>
                    <td>{u.branchId || '—'}</td>
                    <td>
                      <span className={`badge ${statusBadge(u)}`}>
                        {(u.accountStatus || (u.isActive ? 'active' : 'inactive')).toLowerCase()}
                      </span>
                    </td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openView(u, 'referred')}>
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
        <Modal
          title={viewSource === 'referred' ? 'Referred user' : 'Assigned user'}
          onClose={() => setViewUser(null)}
        >
          <div className="detail-row"><strong>Name</strong><span>{viewUser.fullName || '—'}</span></div>
          <div className="detail-row"><strong>Username</strong><span>{viewUser.username || '—'}</span></div>
          {(viewSource === 'referred' || viewUser.email) && (
            <div className="detail-row"><strong>Email</strong><span>{viewUser.email || '—'}</span></div>
          )}
          {(viewSource === 'referred' || viewUser.mobileMasked) && (
            <div className="detail-row"><strong>Mobile</strong><span>{viewUser.mobileMasked || '—'}</span></div>
          )}
          <div className="detail-row"><strong>UUID</strong><span>{viewUser.uuid || '—'}</span></div>
          {(viewSource === 'referred' || viewUser.branchId) && (
            <div className="detail-row"><strong>Branch ID</strong><span>{viewUser.branchId || '—'}</span></div>
          )}
          <div className="detail-row"><strong>Status</strong><span className={`badge ${statusBadge(viewUser)}`}>{(viewUser.accountStatus || (viewUser.isActive ? 'active' : 'inactive')).toLowerCase()}</span></div>
          <div className="detail-row"><strong>Joined</strong><span>{formatDate(viewUser.createdAt)}</span></div>
          <div className="detail-row"><strong>Updated</strong><span>{formatDate(viewUser.updatedAt)}</span></div>
        </Modal>
      )}
    </div>
  );
}
