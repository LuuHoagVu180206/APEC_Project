import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage';
import RegisterPage from './pages/RegisterPage';
import StudioPage from './pages/StudioPage';
import LibraryPage from './pages/LibraryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </Router>
  );
}


export default App;