import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import AdminHeader from '../components/AdminHeader.jsx';
import { downloadJSON, downloadExcelTemplate } from '../utils/importExport.js';

const EMPTY_Q = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  type: 'single',
  question: '',
  options: ['', ''],
  correct: [],
  explanation: '',
});

export default function AdminQuestionsPage() {
  const { subjectId, semesterId } = useParams();
  const navigate = useNavigate();
  const { getSubject, localOverrides, setOverride, removeOverride, deleteSemester, loadSemester } = useData();

  const subject = getSubject(subjectId);
  const key = `${subjectId}/${semesterId}`;
  const overrideData = localOverrides[key];

  const [questions, setQuestions] = useState(() => overrideData?.questions || []);
  const [editing, setEditing] = useState(null); // index | 'new'
  const [search, setSearch] = useState('');
  const [savedFlag, setSavedFlag] = useState(false);

  // Load từ JSON gốc nếu chưa có trong localOverrides
  useEffect(() => {
    let cancel = false;
    async function load() {
      if (!overrideData) {
        try {
          const list = await loadSemester(subjectId, semesterId);
          if (!cancel) setQuestions(list);
        } catch {}
      } else {
        setQuestions(overrideData.questions || []);
      }
    }
    load();
    return () => { cancel = true; };
  }, [subjectId, semesterId, overrideData, loadSemester]);

  function persist(qs) {
    setOverride(key, {
      subjectId,
      semester: semesterId,
      title: `${subject?.name || subjectId} - ${semesterId}`,
      questions: qs,
    });
    setSavedFlag(true);
    setTimeout(() => setSavedFlag(false), 1500);
  }

  function updateQuestion(idx, q) {
    const next = [...questions];
    next[idx] = q;
    setQuestions(next);
  }
  function deleteQuestion(idx) {
    if (!confirm('Xóa câu hỏi này?')) return;
    const next = questions.filter((_, i) => i !== idx);
    setQuestions(next);
    persist(next);
  }
  function addQuestion(q) {
    const next = [q, ...questions];
    setQuestions(next);
    persist(next);
  }
  function moveQuestion(idx, dir) {
    const next = [...questions];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setQuestions(next);
    persist(next);
  }
  function saveEdit(idx, q) {
    if (idx === 'new') {
      addQuestion(q);
    } else {
      const next = [...questions];
      next[idx] = q;
      setQuestions(next);
      persist(next);
    }
    setEditing(null);
  }

  function exportJSON() {
    downloadJSON(`${semesterId}.json`, {
      subjectId,
      semester: semesterId,
      title: `${subject?.name || subjectId} - ${semesterId}`,
      questions,
    });
  }

  function handleDeleteSemester() {
    if (!confirm(`Xoá toàn bộ dữ liệu học kỳ ${semesterId}? Chỉ xóa trong localStorage của bạn.`)) return;
    deleteSemester(subjectId, semesterId);
    navigate(`/admin/subjects/${subjectId}`);
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return questions.map((q, i) => ({ q, i }));
    const s = search.toLowerCase();
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ q }) => q.question.toLowerCase().includes(s));
  }, [questions, search]);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-xl font-bold">Không tìm thấy môn học</h1>
          <Link to="/admin/subjects" className="btn-primary inline-block mt-4">Về danh sách</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader active="subjects" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <div>
            <Link to={`/admin/subjects/${subjectId}`} className="text-sm text-gray-400 hover:text-accent-green">
              ← {subject.name}
            </Link>
            <h1 className="text-2xl font-bold mt-1">{semesterId}</h1>
            <p className="text-sm text-gray-400">{questions.length} câu hỏi</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadExcelTemplate()} className="btn-ghost text-sm">
              Tải mẫu Excel
            </button>
            <button onClick={exportJSON} className="btn-secondary text-sm">
              Tải file JSON
            </button>
            <button onClick={handleDeleteSemester} className="btn-danger text-sm">Xóa học kỳ</button>
          </div>
        </div>

        {savedFlag && (
          <div className="glass rounded-xl px-4 py-2 text-sm text-accent-green mb-4 fade-up">
            ✓ Đã lưu vào localStorage. Commit file JSON để mọi người cùng thấy.
          </div>
        )}

        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="search"
              className="input flex-1 min-w-[200px]"
              placeholder="Tìm trong câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() => setEditing('new')} className="btn-primary">
              + Thêm câu hỏi
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center text-gray-400">
              {questions.length === 0 ? 'Chưa có câu hỏi nào.' : 'Không tìm thấy câu phù hợp.'}
            </div>
          ) : (
            filtered.map(({ q, i }) => (
              <QuestionRow
                key={q.id || i}
                index={i + 1}
                q={q}
                onEdit={() => setEditing(i)}
                onDelete={() => deleteQuestion(i)}
                onMoveUp={() => moveQuestion(i, -1)}
                onMoveDown={() => moveQuestion(i, 1)}
              />
            ))
          )}
        </div>

        <div className="glass rounded-2xl p-4 mt-6 text-xs text-gray-400">
          <p className="font-semibold text-gray-300 mb-1">📌 Hướng dẫn commit:</p>
          <p>Sau khi chỉnh sửa xong, bấm <b>"Tải file JSON"</b> ở trên. Copy nội dung file vào <code>public/data/{subjectId}/{semesterId}.json</code> trong repo, commit & push để deploy.</p>
        </div>
      </main>

      {editing !== null && (
        <QuestionEditor
          initial={editing === 'new' ? EMPTY_Q() : questions[editing]}
          onClose={() => setEditing(null)}
          onSave={(q) => saveEdit(editing, q)}
        />
      )}
    </div>
  );
}

function QuestionRow({ index, q, onEdit, onMoveUp, onMoveDown, onDelete }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400 font-mono">#{index}</span>
            <span className={`tag ${q.type === 'multiple' ? 'tag-yellow' : 'tag-green'}`}>
              {q.type === 'multiple' ? 'Nhiều' : 'Một'}
            </span>
            <span className="tag">{q.options.length} lựa chọn</span>
          </div>
          <p className="font-medium text-sm line-clamp-2">{q.question}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {q.options.map((opt, i) => {
              const isCorrect = q.correct.includes(i);
              return (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded ${
                    isCorrect
                      ? 'bg-accent-green/15 text-accent-green border border-accent-green/30'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {opt.length > 30 ? opt.slice(0, 30) + '…' : opt}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={onMoveUp} className="btn-ghost text-xs px-2">↑</button>
          <button onClick={onMoveDown} className="btn-ghost text-xs px-2">↓</button>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onEdit} className="btn-ghost text-xs flex-1">Sửa</button>
        <button onClick={onDelete} className="btn-danger text-xs">Xóa</button>
      </div>
    </div>
  );
}

function QuestionEditor({ initial, onClose, onSave }) {
  const [form, setForm] = useState(initial);
  const [err, setErr] = useState('');

  function update(patch) {
    setForm({ ...form, ...patch });
  }
  function setOption(i, val) {
    const next = [...form.options];
    next[i] = val;
    update({ options: next });
  }
  function addOption() {
    if (form.options.length >= 6) return;
    update({ options: [...form.options, ''] });
  }
  function removeOption(i) {
    if (form.options.length <= 2) return;
    const next = form.options.filter((_, idx) => idx !== i);
    // Bỏ correct nếu index nằm ngoài
    const newCorrect = form.correct
      .filter((c) => c !== i)
      .map((c) => (c > i ? c - 1 : c));
    update({ options: next, correct: newCorrect });
  }
  function toggleCorrect(i) {
    if (form.type === 'single') {
      update({ correct: [i] });
    } else {
      const has = form.correct.includes(i);
      update({ correct: has ? form.correct.filter((c) => c !== i) : [...form.correct, i].sort() });
    }
  }

  function submit() {
    if (!form.question.trim()) { setErr('Nhập nội dung câu hỏi'); return; }
    const opts = form.options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) { setErr('Cần ít nhất 2 lựa chọn không rỗng'); return; }
    if (form.correct.length === 0) { setErr('Chọn ít nhất 1 đáp án đúng'); return; }
    onSave({
      ...form,
      question: form.question.trim(),
      options: opts,
      correct: form.correct.filter((c) => c < opts.length).sort((a, b) => a - b),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="glass-strong rounded-2xl p-6 w-full max-w-2xl my-8 fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{initial.question ? 'Sửa câu hỏi' : 'Thêm câu hỏi'}</h2>
          <button onClick={onClose} className="btn-ghost text-sm">Đóng</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Loại câu hỏi</label>
            <div className="flex gap-2">
              <button
                onClick={() => update({ type: 'single', correct: form.correct.slice(0, 1) })}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm transition ${
                  form.type === 'single'
                    ? 'border-accent-green/60 bg-accent-green/15 text-accent-green'
                    : 'border-white/10 bg-white/5 text-gray-300'
                }`}
              >
                Một đáp án
              </button>
              <button
                onClick={() => update({ type: 'multiple' })}
                className={`flex-1 px-4 py-2 rounded-lg border text-sm transition ${
                  form.type === 'multiple'
                    ? 'border-accent-yellow/60 bg-accent-yellow/15 text-accent-yellow'
                    : 'border-white/10 bg-white/5 text-gray-300'
                }`}
              >
                Nhiều đáp án
              </button>
            </div>
          </div>

          <div>
            <label className="label">Câu hỏi</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Nhập nội dung câu hỏi..."
              value={form.question}
              onChange={(e) => update({ question: e.target.value })}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Các lựa chọn (click vào ô để đánh dấu đáp án đúng)</label>
              <button onClick={addOption} className="text-xs text-accent-green">+ Thêm lựa chọn</button>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, i) => {
                const isCorrect = form.correct.includes(i);
                return (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => toggleCorrect(i)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold transition ${
                        isCorrect
                          ? 'bg-accent-green text-navy-950'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                      title="Đánh dấu đáp án đúng"
                    >
                      {String.fromCharCode(65 + i)}
                    </button>
                    <input
                      className="input"
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                    />
                    {form.options.length > 2 && (
                      <button onClick={() => removeOption(i)} className="btn-danger text-xs">×</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label">Giải thích (tuỳ chọn)</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Giải thích đáp án..."
              value={form.explanation}
              onChange={(e) => update({ explanation: e.target.value })}
            />
          </div>

          {err && <p className="text-sm text-red-400">{err}</p>}
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Huỷ</button>
          <button onClick={submit} className="btn-primary flex-1">Lưu</button>
        </div>
      </div>
    </div>
  );
}