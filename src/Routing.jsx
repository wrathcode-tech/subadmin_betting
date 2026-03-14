import React, { Suspense, lazy, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ScrollToTop from './ScrollToTop';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

function ProtectedRoute() {
  const { subadmin } = useAuth();
  if (!subadmin) return <Navigate to="/login" replace />;
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
const Profile = lazy(() => import('./pages/Profile'));

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
