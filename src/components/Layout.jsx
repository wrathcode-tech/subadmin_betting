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
          <span>{process.env.REACT_APP_TITLE || 'Bookie Subadmin'}</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Dashboard
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Users / Agents
          </NavLink>
          <NavLink to="/bets" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Bets
          </NavLink>
          <NavLink to="/deposits" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Deposits
          </NavLink>
          <NavLink to="/withdrawals" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Withdrawals
          </NavLink>
          <NavLink to="/games" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Games
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Reports
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            Profile
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{subadmin?.name}</span>
            <span className="user-role">Subadmin</span>
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
