import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import PracticePage from './pages/PracticePage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import AdminLoginPage from './pages/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import AdminSubjectPage from './pages/AdminSubjectPage.jsx';
import AdminSemesterPage from './pages/AdminSemesterPage.jsx';
import AdminQuestionsPage from './pages/AdminQuestionsPage.jsx';
import AdminImportPage from './pages/AdminImportPage.jsx';
import AdminSubjectsListPage from './pages/AdminSubjectsListPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import './styles/index.css';

export default function App() {
  return (
    <DataProvider>
      <AdminProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/practice/:subjectId/:semesterId" element={<PracticePage />} />
          <Route path="/result/:subjectId/:semesterId" element={<ResultPage />} />

          <Route path="/admin" element={<AdminLoginPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminDashboardPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/subjects"
            element={
              <RequireAdmin>
                <AdminSubjectsListPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/subjects/:subjectId"
            element={
              <RequireAdmin>
                <AdminSubjectPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/subjects/:subjectId/semesters/:semesterId"
            element={
              <RequireAdmin>
                <AdminSemesterPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/subjects/:subjectId/semesters/:semesterId/questions"
            element={
              <RequireAdmin>
                <AdminQuestionsPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/import"
            element={
              <RequireAdmin>
                <AdminImportPage />
              </RequireAdmin>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AdminProvider>
    </DataProvider>
  );
}