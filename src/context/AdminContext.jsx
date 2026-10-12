import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isAdminAuthed, loginAdmin, logoutAdmin } from '../utils/adminAuth.js';
import { ADMIN_SESSION_KEY, ADMIN_SESSION_DURATION_MS } from '../data/adminConfig.js';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [authed, setAuthed] = useState(isAdminAuthed());

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAdminAuthed() && authed) setAuthed(false);
    }, 60_000);
    return () => clearInterval(interval);
  }, [authed]);

  const login = useCallback((password) => {
    const ok = loginAdmin(password);
    if (ok) setAuthed(true);
    return ok;
  }, []);

  const logout = useCallback(() => {
    logoutAdmin();
    setAuthed(false);
  }, []);

  return (
    <AdminContext.Provider value={{ authed, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin phải nằm trong AdminProvider');
  return ctx;
}