import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
        <div className="text-6xl mb-4">🛰️</div>
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-gray-400 mt-2">Trang bạn tìm không tồn tại.</p>
        <Link to="/" className="btn-primary inline-block mt-6">Về trang chủ</Link>
      </div>
    </div>
  );
}