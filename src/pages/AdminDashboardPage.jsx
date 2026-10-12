import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext.jsx';

export default function AdminDashboardPage() {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
              <span className="text-lg">⚙️</span>
            </div>
            <div>
              <div className="font-bold leading-tight">Admin Panel</div>
              <div className="text-xs text-gray-400 leading-tight">FPT LearnWithMe</div>
            </div>
          </Link>
          <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost">
            Đăng xuất
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-8 fade-up">
          <h1 className="text-2xl font-bold">Chào admin 👋</h1>
          <p className="text-gray-400 text-sm mt-1">
            Quản lý môn học, học kỳ và ngân hàng câu hỏi trắc nghiệm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <AdminCard
            icon="📚"
            title="Quản lý môn học"
            desc="Thêm, sửa, xóa môn học và các học kỳ tương ứng"
            to="/admin/subjects"
          />
          <AdminCard
            icon="📥"
            title="Import câu hỏi"
            desc="Import nhanh nhiều câu hỏi từ file Excel (.xlsx) hoặc JSON"
            to="/admin/import"
          />
          <AdminCard
            icon="📖"
            title="Hướng dẫn"
            desc="Cách commit dữ liệu lên GitHub để mọi người dùng cùng thấy"
            to="/admin/dashboard#guide"
          />
        </div>

        <div id="guide" className="glass rounded-2xl p-6 mt-8">
          <h2 className="font-semibold mb-3">Quy trình cập nhật dữ liệu</h2>
          <ol className="space-y-3 text-sm text-gray-300">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Thêm/sửa môn học & câu hỏi trong trang admin.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>Mở chi tiết môn/học kỳ và bấm <b>"Tải file JSON"</b> để xuất bản mới nhất.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>Copy file JSON mới vào thư mục <code>public/data/</code> của repo trên máy (đúng tên file theo hướng dẫn ở trang chi tiết).</span>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
              <span>Commit & push lên GitHub — Vercel sẽ tự động deploy và mọi người dùng sẽ thấy dữ liệu mới.</span>
            </li>
          </ol>

          <div className="mt-5 p-4 glass-strong rounded-xl text-xs text-gray-400">
            <p className="font-semibold text-gray-300 mb-1">💡 Mẹo:</p>
            <p>Dữ liệu thay đổi trong admin được lưu vào <code>localStorage</code> trên trình duyệt của bạn. Hãy commit file JSON định kỳ để backup và đồng bộ với mọi người.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminCard({ icon, title, desc, to }) {
  return (
    <Link to={to} className="glass glass-hover rounded-2xl p-6 block">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-400 mt-1">{desc}</p>
    </Link>
  );
}