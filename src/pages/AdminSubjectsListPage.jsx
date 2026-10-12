import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import AdminHeader from '../components/AdminHeader.jsx';

export default function AdminSubjectsListPage() {
  const { subjects, getSemesters, setOverride } = useData();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);

  function addSubject(s) {
    setOverride(`subject:${s.id}`, s);
    navigate(`/admin/subjects/${s.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader active="subjects" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">Quản lý môn học</h1>
            <p className="text-sm text-gray-400 mt-1">Tổng cộng {subjects.length} môn</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            + Thêm môn học
          </button>
        </div>

        <div className="space-y-3">
          {subjects.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-gray-400">
              Chưa có môn học nào.
            </div>
          )}
          {subjects.map((s) => {
            const semesters = getSemesters(s.id);
            return (
              <Link
                key={s.id}
                to={`/admin/subjects/${s.id}`}
                className="glass glass-hover rounded-2xl p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${s.color || '#22c55e'}22, ${s.color || '#facc15'}22)`,
                      border: `1px solid ${s.color || '#22c55e'}55`,
                    }}
                  >
                    {s.icon || '📘'}
                  </div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.id.toUpperCase()} • {semesters.length} học kỳ</div>
                  </div>
                </div>
                <span className="text-accent-green text-sm">Quản lý →</span>
              </Link>
            );
          })}
        </div>

        {showAdd && <AddSubjectModal onClose={() => setShowAdd(false)} onAdd={addSubject} />}
      </main>
    </div>
  );
}

function AddSubjectModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    icon: '📘',
    color: '#22c55e',
    description: '',
    semesters: [],
  });
  const [err, setErr] = useState('');

  function submit() {
    if (!form.id.trim() || !form.name.trim()) {
      setErr('ID và tên môn là bắt buộc.');
      return;
    }
    if (!/^[a-z0-9_-]+$/i.test(form.id)) {
      setErr('ID chỉ chứa chữ, số, dấu "-" và _');
      return;
    }
    onAdd(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Thêm môn học</h2>
        <div className="space-y-3">
          <div>
            <label className="label">Mã môn (id)</label>
            <input className="input" placeholder="vd: swt301" value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })} />
          </div>
          <div>
            <label className="label">Tên môn</label>
            <input className="input" placeholder="vd: Software Testing" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Icon (emoji)</label>
              <input className="input" placeholder="📘" value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            </div>
            <div>
              <label className="label">Màu</label>
              <input className="input h-10" type="color" value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Mô tả</label>
            <textarea className="input" rows={2} placeholder="Mô tả ngắn về môn" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          {err && <p className="text-sm text-red-400">{err}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
          <button onClick={submit} className="btn-primary flex-1">Thêm</button>
        </div>
      </div>
    </div>
  );
}