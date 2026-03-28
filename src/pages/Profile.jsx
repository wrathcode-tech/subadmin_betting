import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Users.css';
import './Profile.css';

// function formatDate(iso) {
//   if (!iso) return '—';
//   const d = new Date(iso);
//   return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
// }

// function labelPermission(key) {
//   return key
//     .replace(/([A-Z])/g, ' $1')
//     .replace(/^./, (s) => s.toUpperCase())
//     .trim();
// }

export default function Profile() {
  const { subadmin, authReady, refreshSubAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!authReady) return;
      setLoading(true);
      setError(null);
      const res = await refreshSubAdmin();
      if (cancelled) return;
      if (res?.success !== true) {
        setError(res?.message || 'Could not load profile.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, refreshSubAdmin]);

  // const permissions = subadmin?.permissions && typeof subadmin.permissions === 'object'
  //   ? Object.entries(subadmin.permissions)
  //   : [];

  return (
    <div className="profile-page">
      <header className="page-header">
        <h1>Profile</h1>
        <p>Your subadmin account details</p>
      </header>

      {loading && (
        <p className="profile-loading" role="status">
          Loading profile…
        </p>
      )}

      {!loading && error && (
        <div className="profile-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="profile-grid">
          <section className="profile-card">
            <h2>Account Info</h2>
            <div className="detail-row">
              <strong>Branch owner name</strong>
              <span>{subadmin?.fullName ?? subadmin?.name ?? '—'}</span>
            </div>
            <div className="detail-row">
              <strong>Branch ID</strong>
              <span>{subadmin?.branchId ?? '—'}</span>
            </div>
            <div className="detail-row">
              <strong>Branch name</strong>
              <span>{subadmin?.branchName ?? '—'}</span>
            </div>
            <div className="detail-row">
              <strong>Email</strong>
              <span>{subadmin?.emailId ?? '—'}</span>
            </div>
            <div className="detail-row">
              <strong>Mobile</strong>
              <span>{subadmin?.mobileNumber ?? '—'}</span>
            </div>
            <div className="detail-row">
              <strong>Referral code</strong>
              <span style={{ color: 'green' }}>{subadmin?.referralCode ?? '—'}</span>
            </div>
            
            <div className="detail-row">
              <strong>Status</strong>
              <span>{subadmin?.isActive ? 'Active' : 'Inactive'}</span>
            </div>
           
          </section>

          
        </div>
      )}
    </div>
  );
}
