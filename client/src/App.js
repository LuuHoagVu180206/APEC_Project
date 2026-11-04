import React, { useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import StudioPage from './pages/StudioPage';
import LibraryPage from './pages/LibraryPage';
import QuestionSetPage from './pages/QuestionSetPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import CreateClassPage from './pages/CreateClassPage';
import TeacherClassPage from './pages/TeacherClassPage';
import SchoolRequestPage from './pages/SchoolRequestPage';
import SchoolDiscoveryPage from './pages/SchoolDiscoveryPage';
import SchoolDashboardPage from './pages/SchoolDashboardPage';
import SchoolAdminRequestsPage from './pages/SchoolAdminRequestsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import StudentClassesPage from './pages/StudentClassesPage';
import AdminSchoolsPage from './pages/AdminSchoolsPage';
import AdminSchoolDetailPage from './pages/AdminSchoolDetailPage';
import ToastContainer from './components/ToastContainer';

function App() {
  useEffect(() => {
    const syncSession = async () => {
      try {
        const stored = localStorage.getItem('user');
        const userData = stored ? JSON.parse(stored) : null;
        if (userData && userData.username && userData.role !== 'guest') {
          await axios.post('http://localhost:5000/api/auth/web-session', { user: userData });
        } else {
          await axios.delete('http://localhost:5000/api/auth/web-session');
        }
      } catch (e) {
        // Ignored
      }
    };

    syncSession();

    const handleStorage = (e) => {
      if (e.key === 'user') {
        syncSession();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<Navigate to="/login?mode=register" replace />} />
        <Route path="/register/teacher" element={<Navigate to="/login?mode=register&role=teacher" replace />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/schools" element={<AdminSchoolsPage />} />
        <Route path="/admin/schools/:schoolId" element={<AdminSchoolDetailPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/set/:id" element={<QuestionSetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
        <Route path="/teacher/classes/new" element={<CreateClassPage />} />
        <Route path="/teacher/classes/:id" element={<TeacherClassPage />} />
        <Route path="/student/classes" element={<StudentClassesPage />} />
        <Route path="/school-requests/new" element={<SchoolRequestPage />} />
        <Route path="/school-requests/admin" element={<SchoolAdminRequestsPage />} />
        <Route path="/schools" element={<SchoolDiscoveryPage />} />
        <Route path="/schools/:schoolId" element={<SchoolDashboardPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
