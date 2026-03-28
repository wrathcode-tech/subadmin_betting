import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet, ApiCallPost, ApiCallPatch } from '../api/apiConfig/apiCall';
import { useToast } from '../context/ToastContext';
import './Users.css';
import './Support.css';

const LIMIT = 20;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function normalizeTicket(t) {
  const user = t.user || {};
  return {
    id: t._id,
    ticketId: t.ticketId,
    category: t.category || '—',
    subject: t.subject || '—',
    priority: t.priority || '—',
    status: t.status || 'open',
    hasUnreadReply: t.hasUnreadReply === true,
    createdAt: t.createdAt,
    createdAtFormatted: formatDate(t.createdAt),
    lastMessageAt: t.lastMessageAt,
    lastMessageAtFormatted: formatDate(t.lastMessageAt),
    userName: user.fullName || user.username || user.mobile || '—',
    userMobile: user.mobile || '—',
  };
}

export default function Support() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { ticketId: paramTicketId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });

  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const chatEndRef = useRef(null);

  const statusFilter = searchParams.get('status') || 'open';
  const validStatus = ['open', 'resolved', 'all'].includes(statusFilter) ? statusFilter : 'open';

  const setStatusFilter = (s) => {
    setSearchParams(s === 'all' ? {} : { status: s });
    setPage(1);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = sessionStorage.getItem('token');
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    // Only send status for "resolved". For "open" we fetch all and filter to non-resolved (open + in_progress + any not resolved).
    if (validStatus === 'resolved') params.set('status', 'resolved');
    const url = `${ApiConfig.subAdminSupportTickets}?${params.toString()}`;
    const response = await ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' });
    setLoading(false);
    if (!response || response.success !== true) {
      setTickets([]);
      setError(response?.message || 'Failed to load tickets.');
      return;
    }
    const resData = response.data;
    let list = resData?.data ?? resData?.tickets ?? [];
    list = list.map(normalizeTicket);
    if (validStatus === 'open') {
      list = list.filter((t) => String(t.status).toLowerCase() !== 'resolved');
    }
    setTickets(list);
    setPagination({
      page: resData?.page ?? 1,
      limit: resData?.limit ?? LIMIT,
      total: resData?.total ?? 0,
      totalPages: resData?.totalPages ?? 0,
    });
  }, [validStatus, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const openDetail = useCallback((t) => {
    if (!t?.ticketId) return;
    navigate(`/support/${encodeURIComponent(t.ticketId)}`);
  }, [navigate]);

  useEffect(() => {
    if (!paramTicketId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    const token = sessionStorage.getItem('token');
    setDetailLoading(true);
    ApiCallGet(`${ApiConfig.subAdminSupportTickets}/${paramTicketId}`, { Authorization: token ? `Bearer ${token}` : '' })
      .then((res) => {
        if (cancelled) return;
        if (res?.success === true && res?.data) {
          setDetail(res.data);
        } else {
          setDetail(null);
          showToast(res?.message || 'Failed to load ticket', 'error');
        }
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => { cancelled = true; };
  }, [paramTicketId, showToast]);

  const handleReply = async (e) => {
    e.preventDefault();
    const msg = (replyText || '').trim();
    if (!msg || msg.length < 1 || msg.length > 5000) {
      showToast('Message must be 1–5000 characters', 'error');
      return;
    }
    if (!paramTicketId) return;
    setReplyLoading(true);
    const token = sessionStorage.getItem('token');
    const response = await ApiCallPost(
      `${ApiConfig.subAdminSupportTickets}/${paramTicketId}/reply`,
      { message: msg },
      { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
    );
    setReplyLoading(false);
    if (!response || response.success !== true) {
      showToast(response?.message || 'Failed to send reply', 'error');
      return;
    }
    showToast(response.message || 'Reply sent', 'success');
    setReplyText('');
    setDetail((prev) => prev ? { ...prev, messages: [...(prev.messages || []), response.data] } : null);
  };

  const handleMarkResolved = async () => {
    if (!paramTicketId) return;
    setStatusLoading(true);
    const token = sessionStorage.getItem('token');
    const response = await ApiCallPatch(
      `${ApiConfig.subAdminSupportTickets}/${paramTicketId}/status`,
      { status: 'resolved' },
      { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }
    );
    setStatusLoading(false);
    if (!response || response.success !== true) {
      showToast(response?.message || 'Failed to update status', 'error');
      return;
    }
    showToast(response.message || 'Ticket marked resolved', 'success');
    setDetail((prev) => prev ? { ...prev, status: 'resolved', closedAt: response.data?.closedAt } : null);
    fetchTickets();
  };

  const goBack = () => {
    navigate('/support');
    setDetail(null);
    setReplyText('');
  };

  const showList = !paramTicketId;
  const messages = detail?.messages || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="support-page">
      <header className="page-header">
        <h1>Support</h1>
        <p>View and respond to user support tickets</p>
      </header>

      {showList ? (
        <>
          <div className="toolbar">
            <div className="filter-tabs">
              {['open', 'resolved', 'all'].map((f) => (
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
              <div className="empty-cell">Loading tickets…</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>User</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty-cell">No tickets found</td>
                    </tr>
                  ) : (
                    tickets.map((t) => (
                      <tr key={t.id} className="support-ticket-row" onClick={() => openDetail(t)}>
                        <td className="muted">{t.ticketId}</td>
                        <td>
                          <span className="support-subject">{t.subject}</span>
                          {t.hasUnreadReply && <span className="support-unread-dot" title="Unread reply" />}
                        </td>
                        <td>{t.category}</td>
                        <td><span className={`badge support-priority-${t.priority}`}>{t.priority}</span></td>
                        <td>{t.userName}</td>
                        <td><span className={`badge ${t.status}`}>{t.status}</span></td>
                        <td className="muted">{t.createdAtFormatted}</td>
                        <td><span className="support-open-link">View →</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {!loading && pagination.totalPages > 1 && (
            <div className="pagination">
              <button type="button" className="btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
              <span className="pagination-info">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</span>
              <button type="button" className="btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      ) : (
        <div className="support-detail">
          <button type="button" className="support-back-btn" onClick={goBack}>← Back to list</button>

          {detailLoading ? (
            <div className="support-detail-loading">Loading ticket…</div>
          ) : detail ? (
            <div className="support-chat-box">
              <div className="support-chat-header">
                <div className="support-chat-title-row">
                  <h2 className="support-chat-title">{detail.ticketId} – {detail.subject}</h2>
                </div>
                <div className="support-chat-meta">
                  <span className={`support-chat-status support-chat-status-${detail.status}`}>
                    <span className="support-chat-status-dot" /> {detail.status}
                  </span>
                  <span className="support-chat-user">
                    {detail.user?.fullName || detail.user?.username || '—'} {detail.user?.mobile || ''}
                  </span>
                </div>
                {detail.description && (
                  <p className="support-chat-description">{detail.description}</p>
                )}
                {detail.status !== 'resolved' && (
                  <button type="button" className="support-resolve-btn support-resolve-inline" onClick={handleMarkResolved} disabled={statusLoading}>
                    {statusLoading ? 'Updating…' : 'Mark as resolved'}
                  </button>
                )}
              </div>

              <div className="support-chat-messages">
                {messages.length === 0 ? (
                  <p className="support-no-messages">No messages yet.</p>
                ) : (
                  <>
                    {messages.map((m) => (
                      <div key={m._id} className={`support-bubble support-bubble-${m.senderType}`}>
                        <span className="support-bubble-meta">
                          {m.senderType === 'admin' ? 'Admin' : 'User'} · {formatDate(m.createdAt)}
                        </span>
                        <p className="support-bubble-text">{m.message}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {detail.status !== 'resolved' && (
                <form className="support-chat-reply" onSubmit={handleReply}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    maxLength={5000}
                    disabled={replyLoading}
                  />
                  <button type="submit" className="support-send-btn" disabled={replyLoading || !replyText.trim()}>
                    <span className="support-send-icon" aria-hidden>↩</span>
                    {replyLoading ? 'Sending…' : 'Send Reply'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <p className="support-detail-error">Ticket not found.</p>
          )}
        </div>
      )}
    </div>
  );
}
