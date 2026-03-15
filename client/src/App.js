import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import AdminPage from './pages/AdminPage';
import LeaderboardPage from './pages/LeaderboardPage'; // <--- Import
import RegisterPage from './pages/RegisterPage';
import LibraryPage from './pages/LibraryPage'; // BẮT BUỘC PHẢI CÓ DÒNG NÀY

// ... trong thẻ <Routes>
function App() {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn mặc định (/) sẽ vào trang Login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/register" element={<RegisterPage />} /> 
        {/* Đường dẫn /game sẽ vào trang Game */}
        <Route path="/game" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
    </Router>
  );
}


export default App;