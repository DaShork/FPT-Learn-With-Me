import { useEffect, useMemo, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { fetchJSON } from '../utils/fetchJSON.js';

export default function PracticePage() {
  const { subjectId, semesterId } = useParams();
  const navigate = useNavigate();
  const { getSubject, getSemesters, loadSemester } = useData();
  const subject = getSubject(subjectId);

  const semesters = useMemo(() => getSemesters(subjectId), [getSemesters, subjectId]);

  // Tự động load file theo semester
  const [questions, setQuestions] = useState(null);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancel = false;
    async function run() {
      if (!subject) return;
      // Chọn semester
      if (semesterId === '_pick' || !semesterId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      try {
        const data = await fetchJSON(`/data/${subjectId}/${semesterId}.json`);
        if (cancel) return;
        setMeta(data);
        setQuestions(data.questions || []);
      } catch (e) {
        if (cancel) return;
        setErr(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    run();
    return () => { cancel = true; };
  }, [subjectId, semesterId, subject]);

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
          <h1 className="text-2xl font-bold">Không tìm thấy môn học</h1>
          <p className="text-gray-400 mt-2">Môn {subjectId} chưa có trong hệ thống.</p>
          <Link to="/" className="btn-primary inline-block mt-6">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  // Màn hình chọn học kỳ
  if (semesterId === '_pick' || !semesterId) {
    return <SemesterPicker subject={subject} semesters={semesters} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
        <div className="glass rounded-2xl p-8 shimmer h-64" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
          <h1 className="text-xl font-bold">Lỗi tải câu hỏi</h1>
          <p className="text-gray-400 mt-2">{err}</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-6">Về trang chủ</button>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
          <h1 className="text-xl font-bold">Chưa có câu hỏi</h1>
          <p className="text-gray-400 mt-2">Môn {subject.name} - {semesterId} chưa có câu hỏi.</p>
          <Link to="/" className="btn-primary inline-block mt-6">Về trang chủ</Link>
        </div>
      </div>
    );
  }

  return (
    <QuizRunner
      subject={subject}
      semesterId={semesterId}
      meta={meta}
      questions={questions}
      onExit={() => navigate('/')}
    />
  );
}

function SemesterPicker({ subject, semesters }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-10 py-5">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-sm text-gray-400 hover:text-accent-green transition">← Về trang chủ</Link>
        </div>
      </header>
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-3xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-8 fade-up">
          <div className="flex items-center gap-4 mb-6">
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
            </div>
          </div>
          <p className="text-gray-300 text-sm">{subject.description}</p>

          <div className="divider my-6" />

          <h2 className="font-semibold mb-3">Chọn học kỳ</h2>
          {semesters.length === 0 ? (
            <p className="text-gray-400 text-sm">Môn này chưa có câu hỏi cho bất kỳ học kỳ nào.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {semesters.map((s) => (
                <button
                  key={s}
                  onClick={() => navigate(`/practice/${subject.id}/${s}`)}
                  className="glass glass-hover rounded-xl p-4 text-sm font-semibold"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ========== QUIZ RUNNER ==========

function QuizRunner({ subject, semesterId, meta, questions, onExit }) {
  const [setup, setSetup] = useState(() => loadSettings(subject.id, semesterId));
  const [started, setStarted] = useState(false);
  const navigate = useNavigate();

  function update(key, value) {
    const next = { ...setup, [key]: value };
    setSetup(next);
    saveSettings(subject.id, semesterId, next);
  }

  // Trước khi start -> cho chọn mode
  if (!started) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="px-4 sm:px-6 lg:px-10 py-5">
          <div className="max-w-3xl mx-auto">
            <button onClick={onExit} className="text-sm text-gray-400 hover:text-accent-green transition">
              ← Thoát
            </button>
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-3xl mx-auto w-full">
          <div className="glass-strong rounded-3xl p-8 fade-up">
            <div className="text-xs text-gray-400 mb-1">{subject.id.toUpperCase()} • {semesterId}</div>
            <h1 className="text-2xl font-bold mb-1">{meta?.title || `${subject.name} - ${semesterId}`}</h1>
            <p className="text-gray-400 text-sm">
              {questions.length} câu hỏi • {questions.filter(q => q.type === 'multiple').length} câu nhiều đáp án
            </p>

            <div className="divider my-6" />

            <h2 className="font-semibold mb-4">Cài đặt bài ôn</h2>

            <div className="space-y-4">
              <div>
                <label className="label">Số câu hỏi</label>
                <select
                  className="input"
                  value={setup.num}
                  onChange={(e) => update('num', Math.max(1, Math.min(questions.length, Number(e.target.value))))}
                >
                  <option value={questions.length}>Tất cả ({questions.length})</option>
                  {Array.from(new Set([10, 20, 30, 50, 100].filter(n => n <= questions.length))).map(n => (
                    <option key={n} value={n}>{n} câu</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ToggleRow
                  label="Xáo trộn câu hỏi"
                  value={setup.shuffleQ}
                  onChange={(v) => update('shuffleQ', v)}
                />
                <ToggleRow
                  label="Xáo trộn đáp án"
                  value={setup.shuffleA}
                  onChange={(v) => update('shuffleA', v)}
                />
                <ToggleRow
                  label="Hiện đáp án ngay"
                  value={setup.showAnswer}
                  onChange={(v) => update('showAnswer', v)}
                />
                <ToggleRow
                  label="Chế độ luyện tập (chỉ câu sai)"
                  value={setup.practiceMode}
                  onChange={(v) => update('practiceMode', v)}
                />
              </div>
            </div>

            <button onClick={() => setStarted(true)} className="btn-primary mt-8 w-full">
              Bắt đầu làm bài
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <QuizGame
      subject={subject}
      semesterId={semesterId}
      questions={questions}
      setup={setup}
      onExit={onExit}
      onFinish={(result) => {
        const key = `fptlwm_result_${subject.id}_${semesterId}`;
        sessionStorage.setItem(key, JSON.stringify(result));
        navigate(`/result/${subject.id}/${semesterId}`);
      }}
    />
  );
}

function ToggleRow({ label, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`glass rounded-xl p-3 text-left flex items-center justify-between transition ${
        value ? 'border-accent-green/60' : ''
      }`}
    >
      <span className="text-sm">{label}</span>
      <div
        className={`w-9 h-5 rounded-full relative transition ${
          value ? 'bg-accent-green' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition ${
            value ? 'left-4' : 'left-0.5'
          }`}
        />
      </div>
    </button>
  );
}

function loadSettings(subjectId, semesterId) {
  try {
    const raw = localStorage.getItem(`fptlwm_settings_${subjectId}_${semesterId}`);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {}
  return defaultSettings();
}

function saveSettings(subjectId, semesterId, settings) {
  localStorage.setItem(`fptlwm_settings_${subjectId}_${semesterId}`, JSON.stringify(settings));
}

function defaultSettings() {
  return {
    num: 'all',
    shuffleQ: true,
    shuffleA: true,
    showAnswer: true,
    practiceMode: false,
  };
}

// ===== Game =====

function QuizGame({ subject, semesterId, questions, setup, onExit, onFinish }) {
  // Chuẩn bị danh sách câu hỏi
  const prepared = useMemo(() => prepareQuestions(questions, setup), [questions, setup]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // {questionId: [selectedIndices]}
  const [showResult, setShowResult] = useState({}); // {questionId: bool}
  const [finished, setFinished] = useState(false);
  const startTime = useRef(Date.now());

  const current = prepared[idx];
  const progress = ((idx + 1) / prepared.length) * 100;

  function selectOption(optIdx) {
    if (showResult[current.id]) return;
    const prev = answers[current.id] || [];
    let next;
    if (current.type === 'multiple') {
      next = prev.includes(optIdx) ? prev.filter((i) => i !== optIdx) : [...prev, optIdx];
    } else {
      next = [optIdx];
    }
    setAnswers({ ...answers, [current.id]: next });
  }

  function confirmAnswer() {
    if (!answers[current.id] || answers[current.id].length === 0) return;
    if (setup.showAnswer) {
      setShowResult({ ...showResult, [current.id]: true });
    } else {
      nextQuestion();
    }
  }

  function nextQuestion() {
    if (idx + 1 < prepared.length) {
      setIdx(idx + 1);
    } else {
      finishQuiz();
    }
  }

  function finishQuiz() {
    setFinished(true);
    const elapsedMs = Date.now() - startTime.current;
    const result = computeResult(prepared, answers);
    result.elapsedMs = elapsedMs;
    result.total = prepared.length;
    result.subject = subject;
    result.semesterId = semesterId;
    onFinish(result);
  }

  // Check if currently selected answer is correct
  const selected = answers[current.id] || [];
  const isCorrect = current.correct.length === selected.length &&
    current.correct.every((i) => selected.includes(i));
  const resultShown = !!showResult[current.id];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-4 sm:px-6 lg:px-10 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto glass-strong rounded-2xl px-4 py-3 flex items-center justify-between">
          <button onClick={onExit} className="text-sm text-gray-400 hover:text-accent-green transition">
            ← Thoát
          </button>
          <div className="text-sm font-medium">
            <span className="text-accent-green">{idx + 1}</span> / {prepared.length}
          </div>
          <div className="text-xs text-gray-400">{subject.id.toUpperCase()} • {semesterId}</div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto w-full px-4">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-green to-accent-yellow transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-3xl mx-auto w-full">
        <div className="glass-strong rounded-3xl p-6 sm:p-8 fade-up">
          <div className="flex items-center gap-2 mb-4">
            <span className={`tag ${current.type === 'multiple' ? 'tag-yellow' : 'tag-green'}`}>
              {current.type === 'multiple' ? 'Nhiều đáp án' : 'Một đáp án'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold leading-snug">
            {current.question}
          </h2>

          <div className="mt-6 space-y-3">
            {current.options.map((opt, i) => {
              const isSelected = selected.includes(i);
              const isCorrectAnswer = current.correct.includes(i);
              let state = '';
              if (resultShown) {
                if (isCorrectAnswer) state = 'correct';
                else if (isSelected) state = 'wrong';
              } else if (isSelected) {
                state = 'selected';
              }
              return (
                <div
                  key={i}
                  onClick={() => selectOption(i)}
                  className={`choice ${state} ${resultShown ? 'locked' : ''}`}
                >
                  <div className="key">{String.fromCharCode(65 + i)}</div>
                  <div className="flex-1">{opt}</div>
                  {resultShown && isCorrectAnswer && (
                    <span className="text-accent-green text-xl">✓</span>
                  )}
                  {resultShown && isSelected && !isCorrectAnswer && (
                    <span className="text-red-400 text-xl">✗</span>
                  )}
                </div>
              );
            })}
          </div>

          {resultShown && current.explanation && (
            <div className="mt-5 glass rounded-xl p-4 text-sm text-gray-300">
              <div className="text-xs uppercase tracking-wide text-accent-yellow mb-1.5">Giải thích</div>
              {current.explanation}
            </div>
          )}

          {resultShown && (
            <div className={`mt-4 text-sm font-medium ${isCorrect ? 'text-accent-green' : 'text-red-400'}`}>
              {isCorrect ? '✓ Chính xác!' : `✗ Sai — đáp án đúng: ${current.correct.map(i => String.fromCharCode(65 + i)).join(', ')}`}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            {!resultShown ? (
              <button
                onClick={confirmAnswer}
                disabled={selected.length === 0}
                className="btn-primary flex-1"
              >
                Xác nhận
              </button>
            ) : (
              <button onClick={nextQuestion} className="btn-primary flex-1">
                {idx + 1 === prepared.length ? 'Xem kết quả' : 'Câu tiếp theo →'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function prepareQuestions(questions, setup) {
  let list = [...questions];

  if (setup.shuffleQ) {
    list = shuffle(list);
  }

  if (setup.num && setup.num !== 'all') {
    list = list.slice(0, setup.num);
  }

  if (setup.shuffleA) {
    list = list.map((q) => {
      const idxMap = q.options.map((_, i) => i);
      const shuffled = shuffle(idxMap);
      const newOptions = shuffled.map((i) => q.options[i]);
      const newCorrect = q.correct.map((c) => shuffled.indexOf(c)).sort((a, b) => a - b);
      return { ...q, options: newOptions, correct: newCorrect };
    });
  }

  return list;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeResult(questions, answers) {
  let correct = 0;
  const wrong = [];
  const unanswered = [];
  for (const q of questions) {
    const sel = answers[q.id] || [];
    if (sel.length === 0) {
      unanswered.push(q.id);
      continue;
    }
    const ok = q.correct.length === sel.length && q.correct.every((i) => sel.includes(i));
    if (ok) correct++;
    else wrong.push(q.id);
  }
  return { correct, wrong, unanswered, answers };
}