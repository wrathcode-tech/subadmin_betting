import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

function ProtectedRoute() {
  const { subadmin, authReady } = useAuth();
  const location = useLocation();

  if (!authReady) return null;
  if (!subadmin) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Lazy load pages – only the current route's chunk loads (faster initial load)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Bets = lazy(() => import('./pages/Bets'));
const Deposits = lazy(() => import('./pages/Deposits'));
const Withdrawals = lazy(() => import('./pages/Withdrawals'));
const Games = lazy(() => import('./pages/Games'));
const Reports = lazy(() => import('./pages/Reports'));
const SettlementDetails = lazy(() => import('./pages/SettlementDetails'));
const Support = lazy(() => import('./pages/Support'));
const Profile = lazy(() => import('./pages/Profile'));
const ManageAccount = lazy(() => import('./pages/ManageAccount'));

const Routing = memo(function Routing() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="bets" element={<Bets />} />
              <Route path="deposits" element={<Deposits />} />
              <Route path="withdrawals" element={<Withdrawals />} />
              <Route path="games" element={<Games />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settlement-details" element={<SettlementDetails />} />
              <Route path="support" element={<Support />} />
              <Route path="support/:ticketId" element={<Support />} />
              <Route path="manage-account" element={<ManageAccount />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
});

export default Routing;
