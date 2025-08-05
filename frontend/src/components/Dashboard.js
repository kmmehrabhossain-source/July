import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
  const user = authService.getCurrentUser();

  const dashboardOptions = [
    {
      id: 'martyrs',
      title: 'শহীদদের জীবনী',
      subtitle: 'Life of Martyrs',
      icon: '🕊️',
      description: 'Explore the lives and sacrifices of our brave martyrs',
      color: 'linear-gradient(135deg, #DC143C 0%, #8B0000 100%)'
    },
    {
      id: 'events',
      title: 'জুলাই আন্দোলনের ঘটনা',
      subtitle: 'July Movement Events',
      icon: '📅',
      description: 'Timeline of revolutionary events and protests',
      color: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)'
    },
    {
      id: 'books',
      title: 'জুলাই আন্দোলনের বই',
      subtitle: 'Books of July Movement',
      icon: '📚',
      description: 'Literature and books about the July revolution',
      color: 'linear-gradient(135deg, #2E8B57 0%, #228B22 100%)'
    },
    {
      id: 'articles',
      title: 'জুলাই আন্দোলনের প্রবন্ধ',
      subtitle: 'Articles of July Movement',
      icon: '📰',
      description: 'Research articles and academic papers',
      color: 'linear-gradient(135deg, #4169E1 0%, #1E90FF 100%)'
    },
    {
      id: 'documentaries',
      title: 'ডকুমেন্টারি',
      subtitle: 'Documentaries',
      icon: '🎬',
      description: 'Documentary films and video content',
      color: 'linear-gradient(135deg, #8A2BE2 0%, #9370DB 100%)'
    },
    {
      id: 'songs',
      title: 'গান',
      subtitle: 'Songs',
      icon: '🎵',
      description: 'Revolutionary songs and music',
      color: 'linear-gradient(135deg, #FF1493 0%, #FF69B4 100%)'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Revolutionary Background */}
      <div className="revolutionary-bg">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
        </div>
      </div>

      {/* Header with Navigation */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="revolution-logo">⚔️</div>
            <h1>July Archive</h1>
          </div>

          <div className="user-section">
            <span className="welcome-text">স্বাগতম, {user?.user?.username}!</span>
            <button 
              onClick={() => {
                authService.logout();
                window.location.href = '/login';
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Quote */}
      <section className="hero-section">
        <div className="quote-container">
          <blockquote className="martyrs-quote">
            "নীরবতাকে তো অনেক উপভোগ করা হলো, এবার আমরা কোলাহলের কাছে যেতে চাই।"
          </blockquote>
          <cite className="quote-author">— শহীদ হৃদয় চন্দ্র তরুয়া</cite>
          <div className="quote-subtitle">Shahid Hridoy Chandra Torua</div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="dashboard-main">
        <div className="content-header">
          <h2>জুলাই আন্দোলনের আর্কাইভ</h2>
          <p>July Movement Archive</p>
        </div>

        <div className="options-grid">
          {dashboardOptions.map((option) => (
            <Link 
              key={option.id} 
              to={`/${option.id}`} 
              className="option-card"
              style={{ background: option.color }}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-content">
                <h3 className="option-title">{option.title}</h3>
                <h4 className="option-subtitle">{option.subtitle}</h4>
                <p className="option-description">{option.description}</p>
              </div>
              <div className="option-arrow">→</div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>জুলাই আন্দোলনের স্মৃতিকে সংরক্ষণ করি</p>
          <p>Preserving the Memory of July Movement</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
