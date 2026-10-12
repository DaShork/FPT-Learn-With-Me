/**
 * Parse file Excel thành danh sách câu hỏi (lazy-load xlsx để giảm bundle size).
 */
export async function parseExcelFile(file) {
  const { read, utils } = await import('xlsx');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = utils.sheet_to_json(sheet, { defval: '' });
        const questions = rows
          .map((row, i) => rowToQuestion(row, i))
          .filter(Boolean);
        resolve(questions);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function rowToQuestion(row, idx) {
  const question = (row.question || row.Question || '').toString().trim();
  if (!question) return null;

  const type = ((row.type || row.Type || 'single') + '').toLowerCase().trim();
  const qType = type === 'multiple' ? 'multiple' : 'single';

  const options = [];
  for (let i = 1; i <= 6; i++) {
    const v = row[`option${i}`] ?? row[`Option${i}`];
    if (v != null && String(v).trim() !== '') options.push(String(v).trim());
  }
  if (options.length < 2) {
    throw new Error(`Câu hỏi "${question}" cần ít nhất 2 lựa chọn.`);
  }

  const correctRaw = (row.correct ?? row.Correct ?? '').toString().trim();
  const correct = parseCorrectIndices(correctRaw, options.length);
  if (!correct.length) {
    throw new Error(`Câu hỏi "${question}" thiếu cột "correct".`);
  }

  const explanation = (row.explanation || row.Explanation || '').toString().trim();

  return {
    id: `q${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    type: qType,
    question,
    options,
    correct,
    explanation,
  };
}

function parseCorrectIndices(raw, optionCount) {
  if (!raw) return [];
  return raw
    .split(/[,;|\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // Hỗ trợ A, B, C, D (1-based alpha)
      if (/^[A-Z]$/i.test(s)) return s.toUpperCase().charCodeAt(0) - 65;
      // 1-based index
      const n = parseInt(s, 10);
      if (Number.isNaN(n)) return null;
      return n - 1;
    })
    .filter((n) => n != null && n >= 0 && n < optionCount)
    .map((n) => Number(n));
}

/** Parse JSON thành danh sách câu hỏi. Hỗ trợ 2 format:
 * 1) Array of question objects
 * 2) { questions: [...] }
 */
export function parseJSONQuestions(text) {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : data.questions;
  if (!Array.isArray(arr)) throw new Error('JSON phải là mảng câu hỏi hoặc có key "questions".');
  return arr.map((q, i) => normalizeQuestion(q, i));
}

function normalizeQuestion(q, idx) {
  if (!q || typeof q !== 'object') throw new Error(`Câu hỏi thứ ${idx + 1} không hợp lệ.`);
  const type = q.type === 'multiple' ? 'multiple' : 'single';
  const options = Array.isArray(q.options) ? q.options.map(String) : [];
  if (options.length < 2) throw new Error(`Câu hỏi "${q.question}" cần ít nhất 2 lựa chọn.`);
  const correct = Array.isArray(q.correct) ? q.correct.map(Number) : [];
  if (!correct.length) throw new Error(`Câu hỏi "${q.question}" thiếu "correct".`);
  return {
    id: q.id || `q${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    question: String(q.question || ''),
    options,
    correct,
    explanation: q.explanation ? String(q.explanation) : '',
  };
}

/** Tạo JSON file và trigger download */
export function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, filename);
}

export function downloadText(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  triggerDownload(blob, filename);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Tạo template Excel mẫu để tải về */
export async function downloadExcelTemplate() {
  const sample = [
    {
      question: 'HTML là viết tắt của?',
      type: 'single',
      option1: 'Hyper Text Markup Language',
      option2: 'High Tech Markup Language',
      option3: 'Hyperlinks and Text Markup Language',
      option4: 'Home Tool Markup Language',
      correct: '1',
      explanation: 'HTML = Hyper Text Markup Language.',
    },
    {
      question: 'Các ngôn ngữ lập trình web phổ biến gồm:',
      type: 'multiple',
      option1: 'JavaScript',
      option2: 'Python',
      option3: 'C++',
      option4: 'PHP',
      correct: '1,2,4',
      explanation: 'C++ chủ yếu dùng cho desktop/embedded.',
    },
  ];
  const { utils, write, book_new, book_append_sheet } = await import('xlsx');
  const ws = utils.json_to_sheet(sample);
  const wb = book_new();
  book_append_sheet(wb, ws, 'Questions');
  const out = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  triggerDownload(blob, 'questions_template.xlsx');
}