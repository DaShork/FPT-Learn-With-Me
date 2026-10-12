import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';

export default function RequireAdmin({ children }) {
  const { authed } = useAdmin();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }
  return children;
}