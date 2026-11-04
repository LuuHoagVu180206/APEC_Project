import React, { useEffect, useRef, useCallback } from 'react';

const GamePlayer = ({ username }) => {
  const iframeRef = useRef(null);

  const saveScoreToBackend = useCallback(async (score) => {
    await fetch('http://localhost:5000/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, score })
    });
    alert("Đã lưu điểm số của bạn!");
  }, [username]);
  
  const fetchQuestionsAndSendToGame = useCallback(async () => {
    const res = await fetch('http://localhost:5000/api/questions');
    const questions = await res.json();
    
    // Gửi dữ liệu vào trong Iframe (cho Godot nhận)
    if (iframeRef.current) {
        iframeRef.current.contentWindow.postMessage({
            type: 'LOAD_QUESTIONS',
            data: questions
        }, '*');
    }
  }, []);

  useEffect(() => {
    // Lắng nghe tin nhắn từ Game (Godot) gửi ra
    const handleGameMessage = (event) => {
      if (event.data.type === 'GAME_OVER') {
        const score = event.data.score;
        console.log("Game over! Score:", score);
        
        // Gọi API lưu điểm về Backend
        saveScoreToBackend(score);
      }
      
      if (event.data.type === 'REQUEST_QUESTIONS') {
          // Nếu Game hỏi xin câu hỏi, React gọi API lấy và gửi vào Iframe
          fetchQuestionsAndSendToGame();
      }
    };

    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, [saveScoreToBackend, fetchQuestionsAndSendToGame]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Nhúng game vào đây */}
      <iframe 
        ref={iframeRef} 
        src="/game/v3.0/index.html" // Đường dẫn tới file HTML bạn đã chép vào public
        width="100%" 
        height="100%" 
        title="EduGame"
        style={{ border: 'none' }}
      />
    </div>
  );
};

export default GamePlayer;
