import { ADMIN_SESSION_KEY, ADMIN_SESSION_DURATION_MS } from '../data/adminConfig.js';
import { checkPassword } from '../utils/hash.js';

export function isAdminAuthed() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return false;
  try {
    const ts = JSON.parse(raw);
    return Date.now() - ts < ADMIN_SESSION_DURATION_MS;
  } catch {
    return false;
  }
}

export function loginAdmin(plainPassword) {
  if (!checkPassword(plainPassword)) return false;
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(Date.now()));
  return true;
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}