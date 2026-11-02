import React from 'react';
import { LeaderboardPageLogic } from '../pages_logic/LeaderboardPageLogic';

const LeaderboardPage = () => {
  const { leaders, navigate } = LeaderboardPageLogic();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0b0f19', 
      color: '#f9fafb', 
      padding: '32px 20px', 
      fontFamily: "'Plus Jakarta Sans', sans-serif" 
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <button 
          onClick={() => navigate('/game')} 
          style={{ 
            marginBottom: '24px', 
            padding: '10px 20px', 
            cursor: 'pointer',
            backgroundColor: '#111827',
            border: '1.5px solid #2d3b55',
            color: '#0ea5e9',
            borderRadius: '12px',
            fontWeight: '700',
            fontSize: '14px'
          }}
        >
          ⬅ Quay lại Game
        </button>

        <h1 style={{ color: '#f9fafb', fontSize: '32px', fontWeight: '900', margin: '0 0 24px 0' }}>
          🏆 BẢNG XẾP HẠNG
        </h1>

        <div style={{ 
          background: '#111827', 
          borderRadius: '16px', 
          border: '1.5px solid #1f293d', 
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#151d30', color: '#9ca3af', fontSize: '13px', textTransform: 'uppercase' }}>
              <tr>
                <th style={{ padding: '16px 20px' }}>Hạng</th>
                <th style={{ padding: '16px 20px' }}>Người chơi</th>
                <th style={{ padding: '16px 20px', textAlign: 'right' }}>Điểm cao nhất</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #1f293d', 
                  background: index === 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent' 
                }}>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#38bdf8' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: '#f9fafb' }}>{user.username}</td>
                  <td style={{ padding: '16px 20px', fontWeight: '800', color: '#fbbf24', textAlign: 'right' }}>
                    {user.highScore || 0} Điểm
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
