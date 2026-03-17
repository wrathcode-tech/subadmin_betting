import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useToast } from '../context/ToastContext';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet, ApiCallPatch } from '../api/apiConfig/apiCall';
import './Users.css';

const LIMIT = 20;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeDeposit(d) {
  const user = d.userId;
  return {
    id: d._id,
    transactionId: d.transactionId || d._id,
    userName: user?.fullName || user?.email || '—',
    userUuid: user?.uuid,
    amount: d.amount,
    currency: d.currency || 'INR',
    status: d.status,
    utrNumber: d.utrNumber || '—',
    paymentProofUrl: d.paymentProofUrl,
    paymentMethod: d.paymentMethod || '—',
    createdAt: d.createdAt,
    createdAtFormatted: formatDate(d.createdAt),
  };
}

export default function Deposits() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const { showToast } = useToast();

  const statusFilter = searchParams.get('status') || 'pending';
  const validStatus = ['pending', 'approved', 'rejected', 'all'].includes(statusFilter) ? statusFilter : 'pending';

  const setStatusFilter = (status) => {
    setSearchParams(status === 'all' ? {} : { status });
    setPage(1);
  };

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    let url;
    if (validStatus === 'all') {
      url = `${ApiConfig.subAdminDepositRequests}?${params.toString()}`;
    } else {
      url = `${ApiConfig.subAdminDepositRequests}/${validStatus}?${params.toString()}`;
    }
    const response = await ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' });
    setLoading(false);
    if (!response || response.success !== true) {
      setDeposits([]);
      setError(response?.message || 'Failed to load deposit requests.');
      return;
    }
    const list = response.data?.deposits ?? [];
    setDeposits(list.map(normalizeDeposit));
    setPagination({
      page: response.data?.pagination?.page ?? 1,
      limit: response.data?.pagination?.limit ?? LIMIT,
      total: response.data?.pagination?.total ?? 0,
      totalPages: response.data?.pagination?.totalPages ?? 0,
    });
  }, [validStatus, page]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const updateStatus = async (id, newStatus, item) => {
    const amountStr = `₹${item.amount?.toLocaleString('en-IN')} by ${item.userName}`;

    if (newStatus === 'approved') {
      const result = await Swal.fire({
        title: 'Approve deposit?',
        html: `Approve deposit of <strong>${amountStr}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Approve',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#059669',
      });
      if (!result.isConfirmed) return;
    }

    let rejectReason = '';
    if (newStatus === 'rejected') {
      const result = await Swal.fire({
        title: 'Reject deposit?',
        html: `Reject deposit of <strong>${amountStr}</strong>? You can add a reason below.`,
        icon: 'warning',
        input: 'textarea',
        inputPlaceholder: 'Reject reason (optional)',
        inputAttributes: { rows: 3 },
        showCancelButton: true,
        confirmButtonText: 'Reject',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#dc2626',
      });
      if (!result.isConfirmed) return;
      rejectReason = (result.value || '').trim();
    }

    setActionLoadingId(id);
    const token = sessionStorage.getItem('token');
    const url = `${ApiConfig.subAdminDepositRequests}/${id}`;
    const payload = newStatus === 'approved'
      ? { status: 'approved' }
      : { status: 'rejected', ...(rejectReason.trim() && { rejectReason: rejectReason.trim() }) };
    const response = await ApiCallPatch(url, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setActionLoadingId(null);

    if (!response || response.success !== true) {
      showToast(response?.message || `Failed to ${newStatus} deposit.`, 'error');
      return;
    }
    showToast(response.message || 'Deposit request updated', 'success');
    fetchDeposits();
  };

  return (
    <div className="deposits-page">
      <header className="page-header">
        <h1>Deposits</h1>
        <p>Manage deposit requests of your agents</p>
      </header>

      <div className="toolbar">
        <div className="filter-tabs">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              className={validStatus === f ? 'tab active' : 'tab'}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="login-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="table-wrap">
        {loading ? (
          <div className="empty-cell">Loading deposit requests…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>UTR / Ref</th>
                <th>Status</th>
                <th>Date</th>
                <th>Proof</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty-cell">No deposit requests found</td>
                </tr>
              ) : (
                deposits.map((d) => (
                  <tr key={d.id}>
                    <td className="muted">{d.transactionId}</td>
                    <td>{d.userName}</td>
                    <td>₹{Number(d.amount).toLocaleString('en-IN')}</td>
                    <td>{d.paymentMethod}</td>
                    <td className="muted">{d.utrNumber}</td>
                    <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                    <td className="muted">{d.createdAtFormatted}</td>
                    <td>
                      {d.paymentProofUrl ? (
                        <a href={d.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="btn-sm">View</a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td>
                      {d.status === 'pending' ? (
                        <span className="action-btns">
                          <button type="button" className="btn-sm btn-approve" onClick={() => updateStatus(d.id, 'approved', d)} disabled={actionLoadingId === d.id}>{(actionLoadingId === d.id ? '…' : 'Approve')}</button>
                          <button type="button" className="btn-sm btn-reject" onClick={() => updateStatus(d.id, 'rejected', d)} disabled={actionLoadingId === d.id}>{(actionLoadingId === d.id ? '…' : 'Reject')}</button>
                        </span>
                      ) : (
                        <span className="muted">—</span>
                      )}
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
    </div>
  );
}
