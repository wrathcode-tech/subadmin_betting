import { createContext, useContext, useState, useEffect } from 'react';
import { ApiConfig } from '../api/apiConfig/apiConfig';
import { ApiCallPost } from '../api/apiConfig/apiCall';

const AuthContext = createContext(null);

function normalizeSubAdmin(apiSubAdmin) {
  if (!apiSubAdmin) return null;
  return {
    _id: apiSubAdmin._id,
    name: apiSubAdmin.fullName ?? apiSubAdmin.name,
    fullName: apiSubAdmin.fullName,
    emailId: apiSubAdmin.emailId,
    mobileNumber: apiSubAdmin.mobileNumber,
    isActive: apiSubAdmin.isActive,
    branchId: apiSubAdmin.branchId,
    branchName: apiSubAdmin.branchName,
    permissions: apiSubAdmin.permissions ?? {},
    role: 'subadmin',
  };
}

export function AuthProvider({ children }) {
  const [subadmin, setSubadmin] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bookie_subadmin');
    if (saved) {
      try {
        setSubadmin(JSON.parse(saved));
      } catch {
        // ignore invalid saved auth
      }
    }
    setAuthReady(true);
  }, []);

  const login = async (branchIdOrName, password) => {
    const trimmed = (branchIdOrName || '').trim();
    if (!trimmed || !password) {
      return { success: false, message: 'Enter Branch ID or Name and password.' };
    }

    // Send exactly one of branchId or branchName
    const useBranchId = /^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length <= 20;
    const body = useBranchId
      ? { branchId: trimmed, password }
      : { branchName: trimmed, password };

    const response = await ApiCallPost(ApiConfig.subAdminLogin, body, {
      'Content-Type': 'application/json',
    });

    if (!response) {
      return { success: false, message: 'Network error. Please try again.' };
    }

    // API returns { success, message, data: { subAdmin, accessToken } } — may not include statusCode
    if (response.success !== true) {
      return { success: false, message: response.message || 'Login failed.' };
    }

    const data = response.data;
    const subAdmin = data?.subAdmin;
    const accessToken = data?.accessToken;

    if (!subAdmin || !accessToken) {
      return { success: false, message: 'Invalid response from server.' };
    }

    const user = normalizeSubAdmin(subAdmin);
    setSubadmin(user);
    localStorage.setItem('bookie_subadmin', JSON.stringify(user));
    sessionStorage.setItem('token', accessToken);
    return { success: true };
  };

  const logout = () => {
    setSubadmin(null);
    localStorage.removeItem('bookie_subadmin');
    sessionStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ subadmin, login, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
