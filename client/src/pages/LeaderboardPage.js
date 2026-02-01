import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage = () => {
  const [leaders, setLeaders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/leaderboard');
        setLeaders(res.data);
      } catch (err) {
        console.error("Lỗi lấy BXH:", err);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <button 
        onClick={() => navigate('/game')} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅ Quay lại Game
      </button>

      <h1 style={{ color: '#f1c40f' }}>🏆 BẢNG XẾP HẠNG 🏆</h1>

      <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 0 15px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#2c3e50', color: 'white' }}>
            <tr>
              <th style={{ padding: '15px' }}>Hạng</th>
              <th style={{ padding: '15px' }}>Người chơi</th>
              <th style={{ padding: '15px' }}>Điểm cao nhất</th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((user, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee', background: index === 0 ? '#fff9db' : 'white' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td style={{ padding: '15px' }}>{user.username}</td>
                <td style={{ padding: '15px', fontWeight: 'bold', color: '#e74c3c' }}>{user.highScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;