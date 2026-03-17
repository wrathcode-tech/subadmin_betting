import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { subadmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">📊</span>
          <span>{process.env.REACT_APP_TITLE || 'Branch Admin'}</span>
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
              Users / Agents
            </NavLink>
          </div>
          <div className="nav-category">
            <span className="nav-category-label">Transactions</span>
            <NavLink to="/deposits" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Deposits
            </NavLink>
            <NavLink to="/withdrawals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              Withdrawals
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
