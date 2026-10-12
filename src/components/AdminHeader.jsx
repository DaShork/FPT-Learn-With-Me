import { Link } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminHeader({ active }) {
  const { logout } = useAdmin();
  const tabs = [
    { id: 'subjects', label: 'Môn học', to: '/admin/subjects' },
    { id: 'import', label: 'Import', to: '/admin/import' },
  ];
  return (
    <header className="px-4 sm:px-6 lg:px-10 py-4 sticky top-0 z-30">
      <div className="max-w-5xl mx-auto glass-strong rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg glass flex items-center justify-center">
              <span className="text-sm">⚙️</span>
            </div>
            <span className="font-bold">Admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.id}
                to={t.to}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  active === t.id
                    ? 'bg-accent-green/15 text-accent-green'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {t.label}
              </Link>
            ))}
            <Link to="/" className="px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:bg-white/5">
              Trang chủ ↗
            </Link>
            <button onClick={logout} className="px-3 py-1.5 rounded-lg text-sm text-red-300 hover:bg-red-500/10">
              Đăng xuất
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}