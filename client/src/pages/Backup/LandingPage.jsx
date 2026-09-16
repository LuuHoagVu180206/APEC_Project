import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import '../pages_styling/LandingPageStyling.css';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-wrapper">
            {/* 1. THANH ĐIỀU HƯỚNG (NAVBAR) */}
            <nav className="navbar">
                <div className="nav-left">
                    <h2 className="logo">EduGame</h2>
                    <div className="nav-item">Công cụ học tập <ChevronDown size={16} /></div>
                    <div className="nav-item">Môn học <ChevronDown size={16} /></div>
                </div>
                
                <div className="nav-center">
                    <div className="search-bar">
                        <Search className="search-icon" size={18} />
                        <input type="text" placeholder="Tìm kiếm tài liệu học tập..." />
                    </div>
                </div>

                <div className="nav-right">
                    <button className="btn-create">
                        <Plus size={18} /> Tạo mới
                    </button>
                    <button className="btn-login" onClick={() => navigate('/login')}>
                        Đăng nhập
                    </button>
                </div>
            </nav>

            {/* 2. KHU VỰC HERO */}
            <header className="hero-section">
                <h1 className="hero-title">Bạn muốn học theo cách nào?</h1>
                <p className="hero-subtitle">
                    Khám phá, tạo và chinh phục kiến thức — tất cả tại một nơi. <br />
                    Làm chủ việc học và đạt mục tiêu cùng EduGame.
                </p>
                <div className="hero-actions">
                    <button className="btn-primary" onClick={() => navigate('/register')}>
                        Đăng ký miễn phí
                    </button>
                    <a href="#teacher" className="link-teacher">Tôi là giáo viên</a>
                </div>
            </header>

            {/* 3. KHU VỰC TÍNH NĂNG */}
            <section className="features-section">
                <div className="carousel-container">
                    <button className="nav-arrow left-arrow" aria-label="Previous">
                        <ChevronLeft size={24} />
                    </button>

                    <div className="cards-wrapper">
                        <div className="feature-card card-blue">
                            <h3>Record Lecture</h3>
                            <div className="card-mockup mockup-blue">
                                <div className="wave-bar">||||||||||||||</div>
                                <span>Recording in progress...</span>
                            </div>
                        </div>

                        <div className="feature-card card-green">
                            <h3>Study Guides</h3>
                            <div className="card-mockup mockup-green">
                                <h4>Intro to Psychology</h4>
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line short"></div>
                            </div>
                        </div>

                        <div className="feature-card card-teal">
                            <h3>Flashcards</h3>
                            <div className="card-mockup mockup-teal">
                                <p>Create flashcards on<br/>the solar system</p>
                                <button className="mockup-btn">Start</button>
                            </div>
                        </div>

                        <div className="feature-card card-gray">
                            <h3>Games</h3>
                            <div className="card-mockup mockup-gray">
                                <div className="game-grid">
                                    <div className="gem"></div><div className="gem"></div><div className="gem"></div>
                                    <div className="gem"></div><div className="gem highlight"></div><div className="gem"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="nav-arrow right-arrow" aria-label="Next">
                        <ChevronRight size={24} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;