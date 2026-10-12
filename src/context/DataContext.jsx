import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchJSON } from '../utils/fetchJSON.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache theo subjectId+semesterId để không fetch lại
  const [questionsByKey, setQuestionsByKey] = useState({});

  // Lưu bản local (do admin chỉnh sửa) — ưu tiên dùng bản này
  const [localOverrides, setLocalOverrides] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fptlwm_local_overrides') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('fptlwm_local_overrides', JSON.stringify(localOverrides));
  }, [localOverrides]);

  const reloadSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJSON('/data/subjects.json');
      setSubjects(data.subjects || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadSubjects();
  }, [reloadSubjects]);

  const loadSemester = useCallback(async (subjectId, semesterId) => {
    const key = `${subjectId}/${semesterId}`;
    if (localOverrides[key]) {
      setQuestionsByKey((p) => ({ ...p, [key]: localOverrides[key].questions }));
      return localOverrides[key].questions;
    }
    if (questionsByKey[key]) return questionsByKey[key];

    const data = await fetchJSON(`/data/${subjectId}/${semesterId}.json`);
    setQuestionsByKey((p) => ({ ...p, [key]: data.questions }));
    return data.questions;
  }, [questionsByKey, localOverrides]);

  // Lấy subject từ localOverrides nếu admin vừa thêm
  function getAllSubjects() {
    const map = new Map();
    for (const s of subjects) map.set(s.id, s);
    for (const key of Object.keys(localOverrides)) {
      if (key.startsWith('subject:')) {
        const subj = localOverrides[key];
        map.set(subj.id, subj);
      }
    }
    return Array.from(map.values());
  }

  function getSubject(subjectId) {
    return getAllSubjects().find((s) => s.id === subjectId);
  }

  // Lấy danh sách semester cho subject (gộp từ subject.semesters + các semester trong localOverrides)
  function getSemesters(subjectId) {
    const set = new Set();
    // Từ subjects.json (mặc định)
    const subjectFromList = subjects.find((s) => s.id === subjectId);
    if (subjectFromList?.semesters) {
      for (const s of subjectFromList.semesters) set.add(s);
    }
    // Từ subject do admin thêm (localOverrides)
    const subjOverride = localOverrides[`subject:${subjectId}`];
    if (subjOverride?.semesters) {
      for (const s of subjOverride.semesters) set.add(s);
    }
    // Từ localOverrides dạng `${subjectId}/${semesterId}`
    for (const key of Object.keys(localOverrides)) {
      const [sid, semId] = key.split('/');
      if (sid === subjectId && semId) set.add(semId);
    }
    return Array.from(set).sort();
  }

  function setOverride(key, value) {
    setLocalOverrides((p) => ({ ...p, [key]: value }));
  }

  function removeOverride(key) {
    setLocalOverrides((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  }

  // Xóa semester và đồng thời dọn subject.semesters nếu cần
  function deleteSemester(subjectId, semesterId) {
    const key = `${subjectId}/${semesterId}`;
    setLocalOverrides((p) => {
      const next = { ...p };
      delete next[key];
      // Cập nhật subject override
      const subjKey = `subject:${subjectId}`;
      if (next[subjKey]?.semesters) {
        next[subjKey] = {
          ...next[subjKey],
          semesters: next[subjKey].semesters.filter((s) => s !== semesterId),
        };
      }
      return next;
    });
  }

  // Reset toàn bộ
  function resetAllOverrides() {
    setLocalOverrides({});
  }

  return (
    <DataContext.Provider
      value={{
        subjects: getAllSubjects(),
        loading,
        error,
        reloadSubjects,
        loadSemester,
        localOverrides,
        setOverride,
        removeOverride,
        deleteSemester,
        resetAllOverrides,
        getSubject,
        getSemesters,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData phải nằm trong DataProvider');
  return ctx;
}