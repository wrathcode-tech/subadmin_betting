import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Users.css';
import './Profile.css';

export default function Profile() {
  const { subadmin } = useAuth();
  const { showToast } = useToast();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showToast('New password and confirm do not match', 'error');
      return;
    }
    if (newPass.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    // Demo: any current password works
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Password updated successfully', 'success');
  };

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Profile</h1>
        <p>Your subadmin account details</p>
      </header>
      <div className="profile-grid">
        <section className="profile-card">
          <h2>Account Info</h2>
          <div className="detail-row"><strong>Name</strong><span>{subadmin?.name}</span></div>
          <div className="detail-row"><strong>Username</strong><span>{subadmin?.username}</span></div>
          <div className="detail-row"><strong>Role</strong><span>{subadmin?.role}</span></div>
          <div className="detail-row"><strong>Assigned Agents</strong><span>{subadmin?.assignedAgents ?? 12}</span></div>
        </section>
        <section className="profile-card">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="profile-form">
            <label>
              Current password
              <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} placeholder="••••••••" required />
            </label>
            <label>
              New password
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="••••••••" minLength={6} required />
            </label>
            <label>
              Confirm new password
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="••••••••" required />
            </label>
            <button type="submit" className="btn-primary">Update Password</button>
          </form>
        </section>
      </div>
    </div>
  );
}
