import { useState, useMemo, useCallback, useEffect } from 'react';
import Modal from '../components/Modal';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallPost, ApiCallGet, ApiCallPatch } from '../api/apiConfig/apiCall';
import { useToast } from '../context/ToastContext';
import './Users.css';
import './ManageAccount.css';

const TAB_BANK = 'bank';
const TAB_UPI = 'upi';
const LIMIT = 20;

const emptyBankForm = {
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  branch: '',
  displayOrder: 0,
  status: 'active',
};

const emptyUpiForm = {
  upiId: '',
  displayName: '',
  qrImage: '',
  minDeposit: '',
  maxDeposit: '',
  displayOrder: 0,
  status: 'active',
};

function formatAddedAt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

function normalizeBankItem(d) {
  return {
    id: d._id,
    bankName: d.bankName,
    accountHolderName: d.accountHolderName,
    accountNumber: d.accountNumber ?? '—',
    ifscCode: d.ifscCode,
    branch: d.branch || '—',
    status: d.isActive ? 'active' : 'inactive',
    addedAt: formatAddedAt(d.createdAt),
    displayOrder: d.displayOrder ?? 0,
  };
}

function normalizeUpiItem(d) {
  return {
    id: d._id,
    upiId: d.upiId,
    displayName: d.upiName,
    qrImage: d.qrImage ?? '',
    minDeposit: d.minDeposit ?? '',
    maxDeposit: d.maxDeposit ?? '',
    displayOrder: d.displayOrder ?? 0,
    status: d.isActive ? 'active' : 'inactive',
    addedAt: formatAddedAt(d.createdAt),
  };
}

export default function ManageAccount() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(TAB_BANK);
  const [accounts, setAccounts] = useState([]);
  const [upiList, setUpiList] = useState([]);
  const [filter, setFilter] = useState('all');

  const [bankListLoading, setBankListLoading] = useState(true);
  const [upiListLoading, setUpiListLoading] = useState(true);
  const [bankPage, setBankPage] = useState(1);
  const [upiPage, setUpiPage] = useState(1);
  const [bankPagination, setBankPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [upiPagination, setUpiPagination] = useState({ page: 1, limit: LIMIT, total: 0, totalPages: 0 });
  const [listError, setListError] = useState('');

  const [viewAccount, setViewAccount] = useState(null);
  const [showAddBank, setShowAddBank] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [addBankLoading, setAddBankLoading] = useState(false);
  const [addBankError, setAddBankError] = useState('');
  const [editBankLoading, setEditBankLoading] = useState(false);

  const [viewUpi, setViewUpi] = useState(null);
  const [showAddUpi, setShowAddUpi] = useState(false);
  const [editingUpi, setEditingUpi] = useState(null);
  const [upiForm, setUpiForm] = useState(emptyUpiForm);
  const [addUpiLoading, setAddUpiLoading] = useState(false);
  const [addUpiError, setAddUpiError] = useState('');
  const [editUpiLoading, setEditUpiLoading] = useState(false);

  const fetchBankList = useCallback(async (page = 1) => {
    setBankListLoading(true);
    setListError('');
    const token = sessionStorage.getItem('token');
    const url = `${ApiConfig.subAdminDepositDetails}?type=bank&page=${page}&limit=${LIMIT}`;
    const response = await ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' });
    setBankListLoading(false);
    if (!response || response.success !== true) {
      setAccounts([]);
      setListError(response?.message || 'Failed to load bank details.');
      return;
    }
    const details = response.data?.details ?? [];
    setAccounts(details.map(normalizeBankItem));
    setBankPagination({
      page: response.data?.pagination?.page ?? 1,
      limit: response.data?.pagination?.limit ?? LIMIT,
      total: response.data?.pagination?.total ?? 0,
      totalPages: response.data?.pagination?.totalPages ?? 0,
    });
  }, []);

  const fetchUpiList = useCallback(async (page = 1) => {
    setUpiListLoading(true);
    setListError('');
    const token = sessionStorage.getItem('token');
    const url = `${ApiConfig.subAdminDepositDetails}?type=upi&page=${page}&limit=${LIMIT}`;
    const response = await ApiCallGet(url, { Authorization: token ? `Bearer ${token}` : '' });
    setUpiListLoading(false);
    if (!response || response.success !== true) {
      setUpiList([]);
      setListError(response?.message || 'Failed to load UPI details.');
      return;
    }
    const details = response.data?.details ?? [];
    setUpiList(details.map(normalizeUpiItem));
    setUpiPagination({
      page: response.data?.pagination?.page ?? 1,
      limit: response.data?.pagination?.limit ?? LIMIT,
      total: response.data?.pagination?.total ?? 0,
      totalPages: response.data?.pagination?.totalPages ?? 0,
    });
  }, []);

  useEffect(() => {
    fetchBankList(bankPage);
  }, [bankPage, fetchBankList]);

  useEffect(() => {
    fetchUpiList(upiPage);
  }, [upiPage, fetchUpiList]);

  const filteredAccounts = useMemo(() => {
    if (filter === 'all') return accounts;
    return accounts.filter((a) => a.status === filter);
  }, [accounts, filter]);

  const filteredUpi = useMemo(() => {
    if (filter === 'all') return upiList;
    return upiList.filter((u) => u.status === filter);
  }, [upiList, filter]);

  // ——— Bank ———
  const openAddBank = () => {
    setBankForm(emptyBankForm);
    setShowAddBank(true);
  };

  const openEditBank = (account) => {
    setEditingAccount(account);
    setBankForm({
      bankName: account.bankName,
      accountHolderName: account.accountHolderName,
      accountNumber: account.accountNumber || '',
      ifscCode: account.ifscCode,
      displayOrder: account.displayOrder ?? 0,
      branch: account.branch || '',
      status: account.status || 'active',
    });
  };

  const closeEditBank = () => {
    setEditingAccount(null);
    setBankForm(emptyBankForm);
  };

  const handleAddBankSubmit = async (e) => {
    e.preventDefault();
    setAddBankError('');
    setAddBankLoading(true);
    const token = sessionStorage.getItem('token');
    const payload = {
      type: 'bank',
      bankName: bankForm.bankName.trim(),
      accountHolderName: bankForm.accountHolderName.trim(),
      accountNumber: bankForm.accountNumber.trim(),
      ifscCode: bankForm.ifscCode.trim(),
      displayOrder: Number(bankForm.displayOrder) || 0,
    };
    const response = await ApiCallPost(ApiConfig.subAdminDepositDetails, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setAddBankLoading(false);
    if (!response || response.success !== true) {
      setAddBankError(response?.message || 'Failed to add bank account.');
      return;
    }
    setShowAddBank(false);
    setBankForm(emptyBankForm);
    showToast(response.message || 'Bank detail added', 'success');
    fetchBankList(bankPage);
  };

  const handleEditBankSubmit = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    setEditBankLoading(true);
    const token = sessionStorage.getItem('token');
    const url = `${ApiConfig.subAdminDepositDetails}/${editingAccount.id}`;
    const payload = {
      isActive: bankForm.status === 'active',
      bankName: bankForm.bankName.trim(),
      accountHolderName: bankForm.accountHolderName.trim(),
      accountNumber: (bankForm.accountNumber || '').trim().replace(/\*/g, '') || undefined,
      ifscCode: bankForm.ifscCode.trim(),
      displayOrder: Number(bankForm.displayOrder),
    };
    const response = await ApiCallPatch(url, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setEditBankLoading(false);
    if (!response || response.success !== true) {
      showToast(response?.message || 'Failed to update bank details.', 'error');
      return;
    }
    showToast(response.message || 'Bank details updated', 'success');
    closeEditBank();
    fetchBankList(bankPage);
  };

  // ——— UPI ———
  const openAddUpi = () => {
    setUpiForm(emptyUpiForm);
    setShowAddUpi(true);
  };

  const openEditUpi = (upi) => {
    setEditingUpi(upi);
    setUpiForm({
      upiId: upi.upiId,
      displayName: upi.displayName,
      qrImage: upi.qrImage ?? '',
      minDeposit: upi.minDeposit !== undefined && upi.minDeposit !== '' ? String(upi.minDeposit) : '',
      maxDeposit: upi.maxDeposit !== undefined && upi.maxDeposit !== '' ? String(upi.maxDeposit) : '',
      displayOrder: upi.displayOrder ?? 0,
      status: upi.status || 'active',
    });
  };

  const closeEditUpi = () => {
    setEditingUpi(null);
    setUpiForm(emptyUpiForm);
  };

  const handleAddUpiSubmit = async (e) => {
    e.preventDefault();
    setAddUpiError('');
    setAddUpiLoading(true);
    const token = sessionStorage.getItem('token');
    const payload = {
      type: 'upi',
      upiId: upiForm.upiId.trim(),
      upiName: upiForm.displayName.trim(),
      qrImage: upiForm.qrImage?.trim() || null,
      minDeposit: upiForm.minDeposit ? Number(upiForm.minDeposit) : null,
      maxDeposit: upiForm.maxDeposit ? Number(upiForm.maxDeposit) : null,
      displayOrder: Number(upiForm.displayOrder) || 0,
    };
    const response = await ApiCallPost(ApiConfig.subAdminDepositDetailsUpi, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setAddUpiLoading(false);
    if (!response || response.success !== true) {
      setAddUpiError(response?.message || 'Failed to add UPI detail.');
      return;
    }
    setShowAddUpi(false);
    setUpiForm(emptyUpiForm);
    showToast(response.message || 'UPI detail added', 'success');
    fetchUpiList(upiPage);
  };

  const handleEditUpiSubmit = async (e) => {
    e.preventDefault();
    if (!editingUpi) return;
    setEditUpiLoading(true);
    const token = sessionStorage.getItem('token');
    const url = `${ApiConfig.subAdminDepositDetails}/${editingUpi.id}`;
    const payload = {
      isActive: upiForm.status === 'active',
      upiId: upiForm.upiId.trim(),
      upiName: upiForm.displayName.trim(),
      qrImage: upiForm.qrImage?.trim() || null,
      minDeposit: upiForm.minDeposit ? Number(upiForm.minDeposit) : null,
      maxDeposit: upiForm.maxDeposit ? Number(upiForm.maxDeposit) : null,
      displayOrder: Number(upiForm.displayOrder) || 0,
    };
    const response = await ApiCallPatch(url, payload, {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
    setEditUpiLoading(false);
    if (!response || response.success !== true) {
      showToast(response?.message || 'Failed to update UPI details.', 'error');
      return;
    }
    showToast(response.message || 'UPI details updated', 'success');
    closeEditUpi();
    fetchUpiList(upiPage);
  };

  return (
    <div className="manage-account-page manage-premium">
      <header className="manage-page-header">
        <div className="manage-header-content">
          <span className="manage-header-icon" aria-hidden>◈</span>
          <div>
            <h1 className="manage-title">Manage Account Details</h1>
            <p className="manage-subtitle">Add, edit and view your bank accounts and UPI details</p>
          </div>
        </div>
      </header>

      <div className="manage-tabs">
        <button
          type="button"
          className={`manage-tab ${activeTab === TAB_BANK ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_BANK)}
        >
          Bank Accounts
        </button>
        <button
          type="button"
          className={`manage-tab ${activeTab === TAB_UPI ? 'active' : ''}`}
          onClick={() => setActiveTab(TAB_UPI)}
        >
          UPI Details
        </button>
      </div>

      <div className="manage-toolbar">
        <div className="manage-filter-tabs">
          {['all', 'active', 'inactive'].map((f) => (
            <button
              key={f}
              type="button"
              className={`manage-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {activeTab === TAB_BANK ? (
          <button type="button" className="manage-btn-primary" onClick={openAddBank}>
            + Add Bank Account
          </button>
        ) : (
          <button type="button" className="manage-btn-primary" onClick={openAddUpi}>
            + Add UPI
          </button>
        )}
      </div>

      {listError && <div className="manage-error">{listError}</div>}

      {activeTab === TAB_BANK && (
        <div className="manage-datatable-card">
          <div className="manage-datatable-header">
            <span className="manage-datatable-title">Bank accounts</span>
            {!bankListLoading && (
              <span className="manage-datatable-count">{bankPagination.total} record{bankPagination.total !== 1 ? 's' : ''}</span>
            )}
          </div>
          {bankListLoading ? (
            <div className="manage-loading-state">
              <span className="manage-loading-spinner" />
              <p className="manage-loading-text">Loading bank details…</p>
            </div>
          ) : (
            <>
              <div className="manage-table-wrap">
                <table className="manage-datatable" role="grid">
                  <thead>
                    <tr>
                      <th scope="col">Bank Name</th>
                      <th scope="col">Account Holder</th>
                      <th scope="col">Account Number</th>
                      <th scope="col">IFSC Code</th>
                      <th scope="col">Branch</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="manage-empty-cell">
                          <span className="manage-empty-icon">—</span>
                          No bank accounts found
                        </td>
                      </tr>
                    ) : (
                      filteredAccounts.map((acc, index) => (
                        <tr key={acc.id} className={index % 2 === 1 ? 'manage-row-alt' : ''}>
                          <td className="manage-cell">{acc.bankName}</td>
                          <td className="manage-cell">{acc.accountHolderName}</td>
                          <td className="manage-cell manage-cell-mono">{acc.accountNumber}</td>
                          <td className="manage-cell manage-cell-mono">{acc.ifscCode}</td>
                          <td className="manage-cell manage-cell-muted">{acc.branch}</td>
                          <td><span className={`manage-badge manage-badge-${acc.status}`}>{acc.status}</span></td>
                          <td>
                            <div className="manage-action-btns">
                              <button type="button" className="manage-btn-sm" onClick={() => setViewAccount(acc)}>View</button>
                              <button type="button" className="manage-btn-sm manage-btn-sm-primary" onClick={() => openEditBank(acc)}>Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {bankPagination.totalPages > 1 && (
                <div className="manage-pagination">
                  <button type="button" className="manage-btn-sm" disabled={bankPage <= 1} onClick={() => setBankPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span className="manage-pagination-info">Page {bankPagination.page} of {bankPagination.totalPages} ({bankPagination.total} total)</span>
                  <button type="button" className="manage-btn-sm" disabled={bankPage >= bankPagination.totalPages} onClick={() => setBankPage((p) => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === TAB_UPI && (
        <div className="manage-datatable-card">
          <div className="manage-datatable-header">
            <span className="manage-datatable-title">UPI details</span>
            {!upiListLoading && (
              <span className="manage-datatable-count">{upiPagination.total} record{upiPagination.total !== 1 ? 's' : ''}</span>
            )}
          </div>
          {upiListLoading ? (
            <div className="manage-loading-state">
              <span className="manage-loading-spinner" />
              <p className="manage-loading-text">Loading UPI details…</p>
            </div>
          ) : (
            <>
              <div className="manage-table-wrap">
                <table className="manage-datatable" role="grid">
                  <thead>
                    <tr>
                      <th scope="col">UPI ID</th>
                      <th scope="col">Display Name</th>
                      <th scope="col">Status</th>
                      <th scope="col">Added On</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUpi.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="manage-empty-cell">
                          <span className="manage-empty-icon">—</span>
                          No UPI details found
                        </td>
                      </tr>
                    ) : (
                      filteredUpi.map((u, index) => (
                        <tr key={u.id} className={index % 2 === 1 ? 'manage-row-alt' : ''}>
                          <td className="manage-cell manage-cell-mono">{u.upiId}</td>
                          <td className="manage-cell">{u.displayName}</td>
                          <td><span className={`manage-badge manage-badge-${u.status}`}>{u.status}</span></td>
                          <td className="manage-cell manage-cell-muted">{u.addedAt}</td>
                          <td>
                            <div className="manage-action-btns">
                              <button type="button" className="manage-btn-sm" onClick={() => setViewUpi(u)}>View</button>
                              <button type="button" className="manage-btn-sm manage-btn-sm-primary" onClick={() => openEditUpi(u)}>Edit</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {upiPagination.totalPages > 1 && (
                <div className="manage-pagination">
                  <button type="button" className="manage-btn-sm" disabled={upiPage <= 1} onClick={() => setUpiPage((p) => Math.max(1, p - 1))}>Previous</button>
                  <span className="manage-pagination-info">Page {upiPagination.page} of {upiPagination.totalPages} ({upiPagination.total} total)</span>
                  <button type="button" className="manage-btn-sm" disabled={upiPage >= upiPagination.totalPages} onClick={() => setUpiPage((p) => p + 1)}>Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bank View modal */}
      {viewAccount && (
        <Modal title="Bank Account Details" onClose={() => setViewAccount(null)}>
          <div className="detail-row"><strong>Bank Name</strong><span>{viewAccount.bankName}</span></div>
          <div className="detail-row"><strong>Account Holder</strong><span>{viewAccount.accountHolderName}</span></div>
          <div className="detail-row"><strong>Account Number</strong><span>{viewAccount.accountNumber}</span></div>
          <div className="detail-row"><strong>IFSC Code</strong><span>{viewAccount.ifscCode}</span></div>
          <div className="detail-row"><strong>Branch</strong><span>{viewAccount.branch}</span></div>
          <div className="detail-row"><strong>Status</strong><span className={`badge ${viewAccount.status}`}>{viewAccount.status}</span></div>
          <div className="detail-row"><strong>Added On</strong><span>{viewAccount.addedAt}</span></div>
        </Modal>
      )}

      {/* Bank Add modal */}
      {showAddBank && (
        <Modal title="Add Bank Account" onClose={() => { setShowAddBank(false); setBankForm(emptyBankForm); setAddBankError(''); }}>
          <form onSubmit={handleAddBankSubmit} className="profile-form">
            {addBankError && <div className="login-error" style={{ marginBottom: '1rem' }}>{addBankError}</div>}
            <label>Bank Name * <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))} placeholder="e.g. HDFC Bank" required disabled={addBankLoading} /></label>
            <label>Account Holder Name * <input type="text" value={bankForm.accountHolderName} onChange={(e) => setBankForm((f) => ({ ...f, accountHolderName: e.target.value }))} placeholder="Full name" required disabled={addBankLoading} /></label>
            <label>Account Number * <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="e.g. 1234567890123456" required disabled={addBankLoading} /></label>
            <label>IFSC Code * <input type="text" value={bankForm.ifscCode} onChange={(e) => setBankForm((f) => ({ ...f, ifscCode: e.target.value }))} placeholder="e.g. HDFC0001234" required disabled={addBankLoading} /></label>
            <label>Display Order <input type="number" value={bankForm.displayOrder} onChange={(e) => setBankForm((f) => ({ ...f, displayOrder: e.target.value }))} placeholder="0" min={0} disabled={addBankLoading} /></label>
            <div className="form-actions">
              <button type="button" className="btn-sm" onClick={() => { setShowAddBank(false); setBankForm(emptyBankForm); setAddBankError(''); }} disabled={addBankLoading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={addBankLoading}>{addBankLoading ? 'Adding…' : 'Add Account'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bank Edit modal */}
      {editingAccount && (
        <Modal title="Edit Bank Account" onClose={closeEditBank}>
          <form onSubmit={handleEditBankSubmit} className="profile-form">
            <label>Bank Name * <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm((f) => ({ ...f, bankName: e.target.value }))} required disabled={editBankLoading} /></label>
            <label>Account Holder Name * <input type="text" value={bankForm.accountHolderName} onChange={(e) => setBankForm((f) => ({ ...f, accountHolderName: e.target.value }))} required disabled={editBankLoading} /></label>
            <label>Account Number * <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm((f) => ({ ...f, accountNumber: e.target.value }))} placeholder="Enter full account number" required disabled={editBankLoading} /></label>
            <label>IFSC Code * <input type="text" value={bankForm.ifscCode} onChange={(e) => setBankForm((f) => ({ ...f, ifscCode: e.target.value }))} required disabled={editBankLoading} /></label>
            <label>Display Order <input type="number" value={bankForm.displayOrder} onChange={(e) => setBankForm((f) => ({ ...f, displayOrder: e.target.value }))} min={0} disabled={editBankLoading} /></label>
            <label>Status <select value={bankForm.status} onChange={(e) => setBankForm((f) => ({ ...f, status: e.target.value }))} disabled={editBankLoading}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select></label>
            <div className="form-actions">
              <button type="button" className="btn-sm" onClick={closeEditBank} disabled={editBankLoading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={editBankLoading}>{editBankLoading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPI View modal */}
      {viewUpi && (
        <Modal title="UPI Details" onClose={() => setViewUpi(null)}>
          <div className="detail-row"><strong>UPI ID</strong><span>{viewUpi.upiId}</span></div>
          <div className="detail-row"><strong>Display Name</strong><span>{viewUpi.displayName}</span></div>
          <div className="detail-row"><strong>Status</strong><span className={`badge ${viewUpi.status}`}>{viewUpi.status}</span></div>
          <div className="detail-row"><strong>Added On</strong><span>{viewUpi.addedAt}</span></div>
        </Modal>
      )}

      {/* UPI Add modal */}
      {showAddUpi && (
        <Modal title="Add UPI" onClose={() => { setShowAddUpi(false); setUpiForm(emptyUpiForm); setAddUpiError(''); }}>
          <form onSubmit={handleAddUpiSubmit} className="profile-form">
            {addUpiError && <div className="login-error" style={{ marginBottom: '1rem' }}>{addUpiError}</div>}
            <label>UPI ID * <input type="text" value={upiForm.upiId} onChange={(e) => setUpiForm((f) => ({ ...f, upiId: e.target.value }))} placeholder="e.g. user@paytm" required disabled={addUpiLoading} /></label>
            <label>UPI Name * <input type="text" value={upiForm.displayName} onChange={(e) => setUpiForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="e.g. John Doe" required disabled={addUpiLoading} /></label>
            <label>QR Image URL <input type="text" value={upiForm.qrImage} onChange={(e) => setUpiForm((f) => ({ ...f, qrImage: e.target.value }))} placeholder="https://example.com/qr.png" disabled={addUpiLoading} /></label>
            <label>Min Deposit (₹) <input type="number" value={upiForm.minDeposit} onChange={(e) => setUpiForm((f) => ({ ...f, minDeposit: e.target.value }))} placeholder="100" min={0} disabled={addUpiLoading} /></label>
            <label>Max Deposit (₹) <input type="number" value={upiForm.maxDeposit} onChange={(e) => setUpiForm((f) => ({ ...f, maxDeposit: e.target.value }))} placeholder="50000" min={0} disabled={addUpiLoading} /></label>
            <label>Display Order <input type="number" value={upiForm.displayOrder} onChange={(e) => setUpiForm((f) => ({ ...f, displayOrder: e.target.value }))} placeholder="0" min={0} disabled={addUpiLoading} /></label>
            <div className="form-actions">
              <button type="button" className="btn-sm" onClick={() => { setShowAddUpi(false); setUpiForm(emptyUpiForm); setAddUpiError(''); }} disabled={addUpiLoading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={addUpiLoading}>{addUpiLoading ? 'Adding…' : 'Add UPI'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* UPI Edit modal */}
      {editingUpi && (
        <Modal title="Edit UPI" onClose={closeEditUpi}>
          <form onSubmit={handleEditUpiSubmit} className="profile-form">
            <label>UPI ID * <input type="text" value={upiForm.upiId} onChange={(e) => setUpiForm((f) => ({ ...f, upiId: e.target.value }))} required disabled={editUpiLoading} /></label>
            <label>UPI Name * <input type="text" value={upiForm.displayName} onChange={(e) => setUpiForm((f) => ({ ...f, displayName: e.target.value }))} placeholder="Display name" required disabled={editUpiLoading} /></label>
            <label>QR Image URL <input type="text" value={upiForm.qrImage} onChange={(e) => setUpiForm((f) => ({ ...f, qrImage: e.target.value }))} placeholder="https://example.com/qr.png" disabled={editUpiLoading} /></label>
            <label>Min Deposit (₹) <input type="number" value={upiForm.minDeposit} onChange={(e) => setUpiForm((f) => ({ ...f, minDeposit: e.target.value }))} placeholder="100" min={0} disabled={editUpiLoading} /></label>
            <label>Max Deposit (₹) <input type="number" value={upiForm.maxDeposit} onChange={(e) => setUpiForm((f) => ({ ...f, maxDeposit: e.target.value }))} placeholder="50000" min={0} disabled={editUpiLoading} /></label>
            <label>Display Order <input type="number" value={upiForm.displayOrder} onChange={(e) => setUpiForm((f) => ({ ...f, displayOrder: e.target.value }))} min={0} disabled={editUpiLoading} /></label>
            <label>Status <select value={upiForm.status} onChange={(e) => setUpiForm((f) => ({ ...f, status: e.target.value }))} disabled={editUpiLoading}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select></label>
            <div className="form-actions">
              <button type="button" className="btn-sm" onClick={closeEditUpi} disabled={editUpiLoading}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={editUpiLoading}>{editUpiLoading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
