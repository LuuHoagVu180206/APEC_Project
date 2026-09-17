import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RegisterPage from './pages/RegisterPage';
import StudioPage from './pages/StudioPage';
import LibraryPage from './pages/LibraryPage';
import QuestionSetPage from './pages/QuestionSetPage';
import ProfilePage from './pages/ProfilePage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/set/:id" element={<QuestionSetPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}


export default App;