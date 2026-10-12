import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdmin();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!password.trim()) {
      setErr('Vui lòng nhập mật khẩu');
      return;
    }
    if (login(password)) {
      const dest = location.state?.from || '/admin/dashboard';
      navigate(dest, { replace: true });
    } else {
      setErr('Mật khẩu không đúng');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 w-full max-w-sm fade-up">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl glass mb-3">
            <span className="text-xl">🔐</span>
          </div>
          <h1 className="text-xl font-bold">Đăng nhập Admin</h1>
          <p className="text-xs text-gray-400 mt-1">Khu vực dành riêng cho quản trị viên</p>
        </div>

        <div>
          <label className="label">Mật khẩu</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErr(''); }}
            autoFocus
          />
          {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
        </div>

        <button type="submit" className="btn-primary w-full mt-6">Đăng nhập</button>

        <p className="text-[11px] text-gray-500 text-center mt-4">
          Mật khẩu mặc định: <code className="text-gray-300">fptlearn</code>
        </p>
      </form>
    </div>
  );
}