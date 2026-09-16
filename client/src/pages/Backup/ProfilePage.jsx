import React from 'react';
import { ProfilePageLogic } from '../pages_logic/ProfilePageLogic';

const ProfilePage = () => {
    const { currentUser, formData, setFormData, message, handleUpdateProfile } = ProfilePageLogic();

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '30px' }}>Hồ Sơ Cá Nhân</h2>
            
            {message && (
                <div style={{ 
                    padding: '10px', marginBottom: '20px', textAlign: 'center', borderRadius: '5px',
                    background: message.includes('✅') ? '#d4efdf' : message.includes('❌') ? '#f2d7d5' : '#eaf2f8',
                    color: message.includes('✅') ? '#27ae60' : message.includes('❌') ? '#c0392b' : '#2980b9'
                }}>
                    {message}
                </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#7f8c8d' }}>Tên đăng nhập (Username)</label>
                    <input 
                        type="text" 
                        value={currentUser?.username || ''} 
                        disabled 
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', background: '#ecf0f1', color: '#7f8c8d' }} 
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Họ và tên</label>
                    <input 
                        type="text" 
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={formData.fullName} 
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }} 
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Địa chỉ Email</label>
                    <input 
                        type="email" 
                        placeholder="email@example.com"
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7' }} 
                    />
                </div>

                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tiểu sử ngắn (Bio)</label>
                    <textarea 
                        rows="4" 
                        placeholder="Hãy giới thiệu một chút về bản thân..."
                        value={formData.bio} 
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #bdc3c7', resize: 'vertical' }} 
                    />
                </div>

                <button type="submit" style={{ padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', marginTop: '10px' }}>
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;