import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [subadmin, setSubadmin] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('bookie_subadmin');
    if (saved) {
      try {
        setSubadmin(JSON.parse(saved));
      } catch (_) { /* ignore invalid saved auth */ }
    }
  }, []);

  const login = (username, password) => {
    // Demo: subadmin / subadmin123
    if (username === 'subadmin' && password === 'subadmin123') {
      const user = {
        id: 'sub1',
        name: 'Sub Admin',
        username: 'subadmin',
        role: 'subadmin',
        assignedAgents: 12,
      };
      setSubadmin(user);
      localStorage.setItem('bookie_subadmin', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    setSubadmin(null);
    localStorage.removeItem('bookie_subadmin');
  };

  return (
    <AuthContext.Provider value={{ subadmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
