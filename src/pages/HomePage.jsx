import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';

export default function HomePage() {
  const { subjects, loading, error, getSemesters } = useData();
  const [search, setSearch] = useState('');

  const enriched = useMemo(() => {
    return subjects.map((s) => ({
      ...s,
      semesters: getSemesters(s.id),
    }));
  }, [subjects, getSemesters]);

  const filtered = useMemo(() => {
    if (!search.trim()) return enriched;
    const q = search.toLowerCase();
    return enriched.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)
    );
  }, [enriched, search]);

  // Mặc định đoán semester có sẵn - hiển thị gợi ý trên card
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-10 max-w-7xl mx-auto w-full">
        <Hero count={subjects.length} />

        <div className="mt-10 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold">Danh sách môn học</h2>
            <p className="text-sm text-gray-400 mt-1">Chọn môn và học kỳ để bắt đầu ôn tập</p>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="search"
              className="input"
              placeholder="Tìm kiếm môn học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-48 shimmer" />
            ))}
          </div>
        ) : error ? (
          <div className="glass rounded-2xl p-6 text-red-300">
            <p className="font-semibold">Lỗi tải dữ liệu</p>
            <p className="text-sm mt-1 text-red-400/80">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-ghost mt-4">Thử lại</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">
            Không tìm thấy môn học phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <SubjectCard key={s.id} subject={s} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="px-4 sm:px-6 lg:px-10 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-accent-green to-accent-yellow" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">FPT LearnWithMe</div>
            <div className="text-xs text-gray-400 leading-tight">Ôn tập trắc nghiệm cho FPTers</div>
          </div>
        </Link>
      </div>
    </header>
  );
}

function Hero({ count }) {
  return (
    <section className="glass-strong rounded-3xl p-8 sm:p-12 fade-up">
      <div className="flex items-center gap-2 mb-3">
        <span className="tag tag-green">v1.0</span>
        <span className="tag tag-yellow">React + Vite</span>
        <span className="tag tag-navy">FPT</span>
      </div>
      <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
        Ôn tập cùng nhau,
        <br />
        <span className="bg-gradient-to-r from-accent-green to-accent-yellow bg-clip-text text-transparent">
          vượt qua kỳ thi dễ dàng
        </span>
      </h1>
      <p className="mt-4 text-gray-300 max-w-2xl">
        Nền tảng ôn tập trắc nghiệm miễn phí cho sinh viên FPT. Hỗ trợ cả câu hỏi 1 đáp án và nhiều đáp án, xáo trộn câu hỏi & đáp án mỗi lần làm. Hiện có <b className="text-accent-green">{count}</b> môn học.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <span>Đa dạng môn học & học kỳ</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow" />
          <span>1 hoặc nhiều đáp án đúng</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
          <span>Xem lỗi sai ngay lập tức</span>
        </div>
      </div>
    </section>
  );
}

function SubjectCard({ subject }) {
  return (
    <Link
      to={`/practice/${subject.id}/_pick`}
      className="glass glass-hover rounded-2xl p-6 block fade-up"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            background: `linear-gradient(135deg, ${subject.color || '#22c55e'}22, ${subject.color || '#facc15'}22)`,
            border: `1px solid ${subject.color || '#22c55e'}55`,
          }}
        >
          {subject.icon || '📘'}
        </div>
        <span className="tag">{subject.id.toUpperCase()}</span>
      </div>
      <h3 className="font-semibold text-lg leading-tight">{subject.name}</h3>
      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
        {subject.description || 'Ôn tập trắc nghiệm theo từng học kỳ'}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          {subject.semesters.length > 0 ? (
            <>
              <span className="tag tag-green">{subject.semesters.length} học kỳ</span>
              <span>{subject.semesters.slice(0, 2).join(' • ')}</span>
            </>
          ) : (
            <span>Chưa có câu hỏi</span>
          )}
        </div>
        <span className="text-accent-green">Bắt đầu →</span>
      </div>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="px-4 sm:px-6 lg:px-10 py-6 mt-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
        <div>© {new Date().getFullYear()} FPT LearnWithMe</div>
        <div className="flex items-center gap-3">
          <span>Made with ❤️ for FPTers</span>
        </div>
      </div>
    </footer>
  );
}