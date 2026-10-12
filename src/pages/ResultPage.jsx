import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export default function ResultPage() {
  const { subjectId, semesterId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const key = `fptlwm_result_${subjectId}_${semesterId}`;
    try {
      const raw = sessionStorage.getItem(key);
      if (raw) setResult(JSON.parse(raw));
    } catch {}
  }, [subjectId, semesterId]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
          <h1 className="text-xl font-bold">Không có kết quả</h1>
          <p className="text-gray-400 mt-2">Hãy làm bài trước khi xem kết quả.</p>
          <button onClick={() => navigate(`/practice/${subjectId}/${semesterId}`)} className="btn-primary mt-6">
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  const pct = Math.round((result.correct / result.total) * 100);
  const minutes = Math.floor(result.elapsedMs / 60000);
  const seconds = Math.floor((result.elapsedMs % 60000) / 1000);

  let grade = 'Cần cố gắng';
  let gradeColor = 'text-red-400';
  if (pct >= 90) { grade = 'Xuất sắc'; gradeColor = 'text-accent-green'; }
  else if (pct >= 70) { grade = 'Tốt'; gradeColor = 'text-accent-green'; }
  else if (pct >= 50) { grade = 'Trung bình'; gradeColor = 'text-accent-yellow'; }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-sm text-gray-400 hover:text-accent-green transition">
            ← Về trang chủ
          </Link>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-3xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-8 fade-up text-center">
          <div className="text-xs text-gray-400 mb-1">{subjectId.toUpperCase()} • {semesterId}</div>
          <div className="text-sm text-gray-400">Bài thi của bạn</div>

          <div className="mt-6">
            <div className={`text-7xl font-bold ${gradeColor}`}>{pct}%</div>
            <div className={`mt-2 text-xl font-semibold ${gradeColor}`}>{grade}</div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-8">
            <StatBox label="Đúng" value={result.correct} color="text-accent-green" />
            <StatBox label="Sai" value={result.wrong.length} color="text-red-400" />
            <StatBox label="Bỏ qua" value={result.unanswered.length} color="text-gray-400" />
          </div>

          <div className="text-sm text-gray-400 mt-6">
            ⏱ Thời gian: {minutes > 0 ? `${minutes} phút ` : ''}{seconds} giây
          </div>

          <div className="divider my-8" />

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/practice/${subjectId}/${semesterId}`)}
              className="btn-primary flex-1"
            >
              Làm lại
            </button>
            <Link to="/" className="btn-ghost flex-1 text-center">
              Trang chủ
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}