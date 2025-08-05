import React from 'react';
import { Link } from 'react-router-dom';
import './ContentSection.css';

const ContentSection = ({ title, subtitle, icon, items, type }) => {
  return (
    <div className="content-section-container">
      {/* Revolutionary Background */}
      <div className="revolutionary-bg">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
          <div className="floating-star">★</div>
        </div>
      </div>

      {/* Header */}
      <header className="content-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
          <div className="title-section">
            <div className="section-icon">{icon}</div>
            <div>
              <h1>{title}</h1>
              <h2>{subtitle}</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>জুলাই আন্দোলনের {type}</h2>
          <p>July Movement {type}</p>
        </div>
      </section>

      {/* Content Grid */}
      <main className="content-main">
        <div className="content-grid">
          {items.map((item, index) => (
            <div key={index} className="content-card">
              <div className="content-icon">{item.icon}</div>
              <div className="content-info">
                <h3 className="content-title">{item.title}</h3>
                <h4 className="content-subtitle">{item.subtitle}</h4>
                <p className="content-description">{item.description}</p>
                {item.author && (
                  <p className="content-author">By: {item.author}</p>
                )}
                {item.year && (
                  <p className="content-year">{item.year}</p>
                )}
              </div>
              <div className="content-action">
                <button className="view-btn">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="content-footer">
        <div className="footer-content">
          <p>জুলাই আন্দোলনের স্মৃতিকে সংরক্ষণ করি</p>
          <p>Preserving the Memory of July Movement</p>
        </div>
      </footer>
    </div>
  );
};

export default ContentSection; 