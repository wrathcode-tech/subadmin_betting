import { useAuth } from '../context/AuthContext';
import './Users.css';
import './Profile.css';

export default function Profile() {
  const { subadmin } = useAuth();

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Profile</h1>
        <p>Your subadmin account details</p>
      </header>
      <div className="profile-grid">
        <section className="profile-card">
          <h2>Account Info</h2>
          <div className="detail-row"><strong>Branch OwnerName</strong><span>{subadmin?.name}</span></div>
          <div className="detail-row"><strong>Branch ID</strong><span>{subadmin?.branchId ?? '—'}</span></div>
          <div className="detail-row"><strong>Branch Name</strong><span>{subadmin?.branchName ?? '—'}</span></div>
          <div className="detail-row"><strong>Email</strong><span>{subadmin?.emailId ?? '—'}</span></div>
          <div className="detail-row"><strong>Mobile</strong><span>{subadmin?.mobileNumber ?? '—'}</span></div>
        </section>
      </div>
    </div>
  );
}
