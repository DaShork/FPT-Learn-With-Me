import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import AdminHeader from '../components/AdminHeader.jsx';
import { downloadJSON } from '../utils/importExport.js';

export default function AdminSubjectPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { getSubject, getSemesters, setOverride, removeOverride, localOverrides } = useData();
  const subject = getSubject(subjectId);
  const semesters = useMemo(() => getSemesters(subjectId), [getSemesters, subjectId]);

  const [showAdd, setShowAdd] = useState(false);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-xl font-bold">Không tìm thấy môn học</h1>
          <Link to="/admin/subjects" className="btn-primary inline-block mt-4">Về danh sách</Link>
        </div>
      </div>
    );
  }

  function deleteSubject() {
    if (!confirm(`Xóa môn "${subject.name}"? Hành động này chỉ xóa trong localStorage của bạn.`)) return;
    removeOverride(`subject:${subjectId}`);
    navigate('/admin/subjects');
  }

  function addSemester(semId) {
    const key = `${subjectId}/${semId}`;
    if (!localOverrides[key]) {
      setOverride(key, { subjectId, semester: semId, title: `${subject.name} - ${semId}`, questions: [] });
    }
    // Cập nhật subject.semesters nếu subject đến từ localOverrides
    const subjKey = `subject:${subjectId}`;
    const subjOverride = localOverrides[subjKey];
    if (subjOverride) {
      const newSems = Array.from(new Set([...(subjOverride.semesters || []), semId])).sort();
      setOverride(subjKey, { ...subjOverride, semesters: newSems });
    } else {
      // subject đến từ subjects.json - lưu bản override với semesters mới
      const newSems = Array.from(new Set([...(subject.semesters || []), semId])).sort();
      setOverride(subjKey, { ...subject, semesters: newSems });
    }
    navigate(`/admin/subjects/${subjectId}/semesters/${semId}/questions`);
  }

  function exportSubjectJSON() {
    downloadJSON(`${subjectId}.json`, subject);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader active="subjects" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-6 sm:p-8 fade-up">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${subject.color || '#22c55e'}22, ${subject.color || '#facc15'}22)`,
                  border: `1px solid ${subject.color || '#22c55e'}55`,
                }}
              >
                {subject.icon || '📘'}
              </div>
              <div>
                <div className="text-xs text-gray-400">{subject.id.toUpperCase()}</div>
                <h1 className="text-2xl font-bold">{subject.name}</h1>
                <p className="text-sm text-gray-400 mt-1">{subject.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportSubjectJSON} className="btn-ghost" title="Tải file JSON của môn">
                Tải JSON
              </button>
              <button onClick={deleteSubject} className="btn-danger">Xóa môn</button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Học kỳ ({semesters.length})</h2>
            <button onClick={() => setShowAdd(true)} className="btn-secondary">+ Thêm học kỳ</button>
          </div>

          {semesters.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-gray-400">
              Môn này chưa có học kỳ nào.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {semesters.map((s) => (
                <Link
                  key={s}
                  to={`/admin/subjects/${subjectId}/semesters/${s}/questions`}
                  className="glass glass-hover rounded-xl p-4 text-center"
                >
                  <div className="font-semibold">{s}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {(localOverrides[`${subjectId}/${s}`]?.questions || []).length} câu
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {showAdd && (
          <AddSemesterModal
            onClose={() => setShowAdd(false)}
            onAdd={addSemester}
            existing={semesters}
          />
        )}
      </main>
    </div>
  );
}

function AddSemesterModal({ onClose, onAdd, existing }) {
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  function submit() {
    const id = val.trim();
    if (!id) { setErr('Nhập tên học kỳ'); return; }
    if (existing.includes(id)) { setErr('Học kỳ đã tồn tại'); return; }
    onAdd(id);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-bold mb-4">Thêm học kỳ</h2>
        <div>
          <label className="label">Tên học kỳ</label>
          <input className="input" placeholder="vd: Spring26" value={val}
            onChange={(e) => { setVal(e.target.value); setErr(''); }} />
          <p className="text-xs text-gray-500 mt-2">
            Gợi ý: Spring26, Summer26, Fall26, ...
          </p>
          {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
          <button onClick={submit} className="btn-primary flex-1">Thêm</button>
        </div>
      </div>
    </div>
  );
}