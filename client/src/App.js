import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage'; // <--- Import

// ... trong thẻ <Routes>
function App() {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn mặc định (/) sẽ vào trang Login */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Đường dẫn /game sẽ vào trang Game */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}


export default App;