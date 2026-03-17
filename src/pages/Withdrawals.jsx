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

function formatWithdrawalTo(detail) {
  if (!detail) return '—';
  if (detail.accountHolderName && detail.accountNumber) {
    return `${detail.accountHolderName} • ${detail.bankName || ''} ****${String(detail.accountNumber).slice(-4)}`;
  }
  if (detail.upiId) return detail.upiId;
  return '—';
}

function normalizeWithdrawal(w) {
  const user = w.userId;
  const toDetail = w.withdrawalToDetail;
  return {
    id: w._id,
    transactionId: w.transactionId || w._id,
    userName: user?.fullName || user?.email || '—',
    userUuid: user?.uuid,
    amount: w.amount,
    currency: w.currency || 'INR',
    status: w.status,
    withdrawalTo: formatWithdrawalTo(toDetail),
    createdAt: w.createdAt,
    createdAtFormatted: formatDate(w.createdAt),
  };
}

export default function Withdrawals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [withdrawals, setWithdrawals] = useState([]);
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

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    let url;
    if (validStatus === 'all') {
      url = `${ApiConfig.subAdminWithdrawalRequests}?${params.toString()}`;
    } else {
      url = `${ApiConfig.subAdminWithdrawalRequests}/${validStatus}?${params.toString()}`;
    }
    const response = await ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' });
    setLoading(false);
    if (!response || response.success !== true) {
      setWithdrawals([]);
      setError(response?.message || 'Failed to load withdrawal requests.');
      return;
    }
    const list = response.data?.withdrawals ?? [];
    setWithdrawals(list.map(normalizeWithdrawal));
    setPagination({
      page: response.data?.pagination?.page ?? 1,
      limit: response.data?.pagination?.limit ?? LIMIT,
      total: response.data?.pagination?.total ?? 0,
      totalPages: response.data?.pagination?.totalPages ?? 0,
    });
  }, [validStatus, page]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  const updateStatus = async (id, newStatus, item) => {
    const amountStr = `₹${item.amount?.toLocaleString('en-IN')} by ${item.userName}`;

    if (newStatus === 'approved') {
      const result = await Swal.fire({
        title: 'Approve withdrawal?',
        html: `Approve withdrawal of <strong>${amountStr}</strong>?`,
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
        title: 'Reject withdrawal?',
        html: `Reject withdrawal of <strong>${amountStr}</strong>? You can add a reason below.`,
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
    const url = `${ApiConfig.subAdminWithdrawalRequests}/${id}`;
    const payload = newStatus === 'approved'
      ? { status: 'approved' }
      : { status: 'rejected', ...(rejectReason && { rejectReason }) };
    const response = await ApiCallPatch(url, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setActionLoadingId(null);

    if (!response || response.success !== true) {
      showToast(response?.message || `Failed to ${newStatus} withdrawal.`, 'error');
      return;
    }
    showToast(response.message || 'Withdrawal request updated', 'success');
    fetchWithdrawals();
  };

  return (
    <div className="withdrawals-page">
      <header className="page-header">
        <h1>Withdrawals</h1>
        <p>Manage withdrawal requests of your agents</p>
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
          <div className="empty-cell">Loading withdrawal requests…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>User</th>
                <th>Amount</th>
                <th>Withdrawal To</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-cell">No withdrawal requests found</td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="muted">{w.transactionId}</td>
                    <td>{w.userName}</td>
                    <td>₹{Number(w.amount).toLocaleString('en-IN')}</td>
                    <td className="muted">{w.withdrawalTo}</td>
                    <td><span className={`badge ${w.status}`}>{w.status}</span></td>
                    <td className="muted">{w.createdAtFormatted}</td>
                    <td>
                      {w.status === 'pending' ? (
                        <span className="action-btns">
                          <button type="button" className="btn-sm btn-approve" onClick={() => updateStatus(w.id, 'approved', w)} disabled={actionLoadingId === w.id}>{actionLoadingId === w.id ? '…' : 'Approve'}</button>
                          <button type="button" className="btn-sm btn-reject" onClick={() => updateStatus(w.id, 'rejected', w)} disabled={actionLoadingId === w.id}>{actionLoadingId === w.id ? '…' : 'Reject'}</button>
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
