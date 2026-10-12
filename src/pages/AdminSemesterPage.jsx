import { Link } from 'react-router-dom';

export default function AdminSemesterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
        <h1 className="text-xl font-bold">Điều hướng</h1>
        <p className="text-gray-400 text-sm mt-2">Trang này không còn dùng — bạn sẽ được chuyển đến trang quản lý câu hỏi.</p>
        <Link to="/admin/subjects" className="btn-primary inline-block mt-4">Về danh sách môn</Link>
      </div>
    </div>
  );
}