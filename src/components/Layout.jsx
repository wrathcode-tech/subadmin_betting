import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallGet } from '../api/apiConfig/apiCall';
import './Layout.css';

export default function Layout() {
  const { subadmin, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingCounts, setPendingCounts] = useState({
    deposits: 0,
    withdrawals: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem('token');

    ApiCallGet(ApiConfig.subAdminDashboard, { Authorization: token ? `Bearer ${token}` : '' })
      .then((res) => {
        if (cancelled || res?.success !== true || !res?.data) return;
        setPendingCounts({
          deposits: Number(res.data.pendingDepositCount || 0),
          withdrawals: Number(res.data.pendingWithdrawalCount || 0),
        });
      })
      .catch(() => { });

    return () => { cancelled = true; };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon"><img src="/favicon.svg" alt="logo" style={{ width: "70%" }} /></span>
          <span>Subadmin</span>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-category">
            <span className="nav-category-label">Overview</span>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Dashboard
            </NavLink>
          </div>
          <div className="nav-category">
            <span className="nav-category-label">Users</span>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Users
            </NavLink>
          </div>
          <div className="nav-category">
            <span className="nav-category-label">Transactions</span>
            <NavLink to="/deposits" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>Deposits</span>
              {pendingCounts.deposits > 0 && (
                <span className="nav-count-badge">{pendingCounts.deposits}</span>
              )}
            </NavLink>
            <NavLink to="/withdrawals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <span>Withdrawals</span>
              {pendingCounts.withdrawals > 0 && (
                <span className="nav-count-badge">{pendingCounts.withdrawals}</span>
              )}
            </NavLink>
          </div>
          <div className="nav-category">
            <span className="nav-category-label">Support</span>
            <NavLink to="/support" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Support
            </NavLink>
          </div>
          <div className="nav-category">
            <span className="nav-category-label">Reports & Account</span>
            <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Reports
            </NavLink>
            <NavLink to="/settlement-details" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Settlement Details
            </NavLink>
            <NavLink to="/manage-account" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Manage Account Details
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Profile
            </NavLink>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{subadmin?.name}</span>
            <span className="user-role">{subadmin?.mobileNumber}</span>
          </div>
          <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
