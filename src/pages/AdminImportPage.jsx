import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import AdminHeader from '../components/AdminHeader.jsx';
import {
  parseExcelFile,
  parseJSONQuestions,
  downloadExcelTemplate,
  downloadJSON,
} from '../utils/importExport.js';

export default function AdminImportPage() {
  const { subjects, getSemesters, setOverride } = useData();
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [semesterId, setSemesterId] = useState('Spring26');
  const [parsed, setParsed] = useState(null);
  const [parseErr, setParseErr] = useState('');
  const [success, setSuccess] = useState('');

  const semesters = getSemesters(subjectId);

  async function onExcel(e) {
    setParseErr(''); setSuccess(''); setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const list = await parseExcelFile(file);
      setParsed(list);
    } catch (err) {
      setParseErr(err.message);
    }
    e.target.value = '';
  }

  function onJSON(e) {
    setParseErr(''); setSuccess(''); setParsed(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const list = parseJSONQuestions(ev.target.result);
        setParsed(list);
      } catch (err) {
        setParseErr(err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function importToSemester() {
    if (!parsed) return;
    if (!subjectId || !semesterId) {
      setParseErr('Chọn môn và học kỳ trước.');
      return;
    }
    const key = `${subjectId}/${semesterId}`;
    setOverride(key, {
      subjectId,
      semester: semesterId,
      title: `${subjects.find((s) => s.id === subjectId)?.name || subjectId} - ${semesterId}`,
      questions: parsed,
    });
    setSuccess(`Đã import ${parsed.length} câu hỏi vào ${subjectId}/${semesterId}.`);
    setParsed(null);
    setTimeout(() => setSuccess(''), 4000);
  }

  function exportParsedJSON() {
    downloadJSON(`${semesterId}.json`, {
      subjectId,
      semester: semesterId,
      title: `${subjects.find((s) => s.id === subjectId)?.name || subjectId} - ${semesterId}`,
      questions: parsed,
    });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader active="import" />
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-4xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-1">Import câu hỏi</h1>
        <p className="text-sm text-gray-400 mb-6">
          Import nhanh nhiều câu hỏi từ Excel (.xlsx) hoặc JSON. Dữ liệu sẽ được lưu vào localStorage — commit file JSON để mọi người cùng thấy.
        </p>

        <div className="glass-strong rounded-2xl p-6 mb-4">
          <h2 className="font-semibold mb-3">1. Chọn môn & học kỳ đích</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Môn học</label>
              <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                <option value="">-- Chọn môn --</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id.toUpperCase()})</option>
                ))}
              </select>
              {subjects.length === 0 && (
                <Link to="/admin/subjects" className="text-xs text-accent-green mt-2 inline-block">
                  + Tạo môn học trước
                </Link>
              )}
            </div>
            <div>
              <label className="label">Học kỳ</label>
              <input
                className="input"
                placeholder="vd: Spring26"
                value={semesterId}
                onChange={(e) => setSemesterId(e.target.value)}
                list="semester-list"
              />
              <datalist id="semester-list">
                {semesters.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 mb-4">
          <h2 className="font-semibold mb-3">2. Chọn file nguồn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="glass-hover glass rounded-xl p-4 cursor-pointer block">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-sm">Import từ Excel</div>
              <div className="text-xs text-gray-400 mt-1">Hỗ trợ .xlsx — cột: question, option1..6, type, correct, explanation</div>
              <input type="file" accept=".xlsx,.xls" onChange={onExcel} className="hidden" />
            </label>
            <label className="glass-hover glass rounded-xl p-4 cursor-pointer block">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold text-sm">Import từ JSON</div>
              <div className="text-xs text-gray-400 mt-1">Mảng câu hỏi hoặc {"{ questions: [...] }"}</div>
              <input type="file" accept=".json,application/json" onChange={onJSON} className="hidden" />
            </label>
          </div>
          <button onClick={() => downloadExcelTemplate()} className="btn-ghost text-sm mt-4">
            ⬇ Tải file Excel mẫu
          </button>
        </div>

        {parseErr && (
          <div className="glass rounded-2xl p-4 mb-4 border border-red-500/40 text-sm text-red-300">
            ✗ {parseErr}
          </div>
        )}

        {success && (
          <div className="glass rounded-2xl p-4 mb-4 border border-accent-green/40 text-sm text-accent-green">
            ✓ {success}
          </div>
        )}

        {parsed && (
          <div className="glass-strong rounded-2xl p-6 fade-up">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="font-semibold">3. Xem trước & lưu ({parsed.length} câu)</h2>
              <div className="flex gap-2">
                <button onClick={exportParsedJSON} className="btn-ghost text-sm">Tải JSON</button>
                <button onClick={importToSemester} className="btn-primary text-sm">Lưu vào học kỳ</button>
              </div>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {parsed.map((q, i) => (
                <div key={i} className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                    <span className={`tag ${q.type === 'multiple' ? 'tag-yellow' : 'tag-green'}`}>
                      {q.type === 'multiple' ? 'Nhiều' : 'Một'}
                    </span>
                  </div>
                  <p className="text-sm">{q.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}