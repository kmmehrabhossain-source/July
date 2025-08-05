import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import songService from '../services/songService';
import './Songs.css';

const Songs = () => {
  const user = authService.getCurrentUser();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminSongs, setAdminSongs] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Create array of promises for all loading operations
        const promises = [loadSongs()];
        
        if (user?.user?.role === 'admin') {
          promises.push(loadAdminSongs());
        }
        if (user) {
          promises.push(loadUserSubmissions());
        }
        
        // Wait for all promises to complete
        await Promise.all(promises);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [user]);

  const loadSongs = async () => {
    try {
      console.log('Loading songs...');
      const response = await songService.getApprovedSongs();
      console.log('Songs response:', response);
      
      // Always set songs to the response data, even if empty
      setSongs(response.data || []);
      console.log('Loading complete');
    } catch (error) {
      console.error('Error loading songs:', error);
      // Set empty array when API fails
      setSongs([]);
    }
  };

  const loadAdminSongs = async () => {
    try {
      const response = await songService.getAllSongs();
      if (response.success) {
        setAdminSongs(response.data);
      }
    } catch (error) {
      console.error('Error loading admin songs:', error);
    }
  };

  const loadUserSubmissions = async () => {
    try {
      const response = await songService.getUserSubmissions();
      if (response.success) {
        setUserSubmissions(response.data);
      }
    } catch (error) {
      console.error('Error loading user submissions:', error);
    }
  };

  const handleApprove = async (songId) => {
    try {
      const response = await songService.approveSong(songId, 'approve');
      if (response.success) {
        loadAdminSongs();
        loadSongs();
      }
    } catch (error) {
      console.error('Error approving song:', error);
    }
  };

  const handleReject = async (songId, reason) => {
    try {
      const response = await songService.approveSong(songId, 'reject', reason);
      if (response.success) {
        loadAdminSongs();
      }
    } catch (error) {
      console.error('Error rejecting song:', error);
    }
  };

  const handleDelete = async (songId) => {
    try {
      if (window.confirm('Are you sure you want to delete this song?')) {
        const response = await songService.deleteSong(songId);
        if (response.success) {
          loadAdminSongs();
          loadSongs();
          loadUserSubmissions();
        }
      }
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  return (
    <div className="songs-container">
      {/* Revolutionary Background */}
      <div className="revolutionary-bg">
        <div className="bg-pattern"></div>
        <div className="floating-elements">
          <div className="floating-star">🎵</div>
          <div className="floating-star">🎵</div>
          <div className="floating-star">🎵</div>
        </div>
      </div>

      {/* Header */}
      <header className="songs-header">
        <div className="header-content">
          <Link to="/dashboard" className="back-btn">← Back to Dashboard</Link>
          <h1>গান</h1>
          <h2>Revolutionary Songs</h2>
          
          <div className="header-actions">
            <button 
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="submit-btn"
            >
              Submit Song
            </button>
            {user?.user?.role === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="admin-btn"
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>জুলাই আন্দোলনের গান</h2>
          <p>Songs of the July Movement</p>
        </div>
        
        {/* Quote Section */}
        <div className="quote-container">
          <blockquote className="songs-quote">
            "স্বর্গের ছাদে খেলা করে রিয়া গোপ, ঐ যে নাফিজ রিকশা পালকি চড়ে"
          </blockquote>
        </div>
      </section>

      {/* Song Submit Form */}
      {showSubmitForm && (
        <section className="submit-section">
          <SongSubmitForm 
            onSuccess={() => {
              setShowSubmitForm(false);
              loadUserSubmissions();
            }}
          />
        </section>
      )}

      {/* Admin Panel */}
      {showAdminPanel && user?.user?.role === 'admin' && (
        <section className="admin-section">
          <AdminPanel 
            songs={adminSongs}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        </section>
      )}

      {/* User Submissions */}
      {user && userSubmissions.length > 0 && (
        <section className="submissions-section">
          <h3>Your Submissions</h3>
          <div className="submissions-grid">
            {userSubmissions.map((submission) => (
              <SubmissionCard key={submission._id} submission={submission} />
            ))}
          </div>
        </section>
      )}

      {/* Songs Grid */}
      <main className="songs-main">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading revolutionary songs...</p>
          </div>
        ) : songs.length > 0 ? (
          <div className="songs-grid">
            {songs.map((song) => (
              <SongCard key={song._id} song={song} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <h3>No Approved Songs Yet</h3>
              <p>Be the first to submit a revolutionary song!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Song Card Component
const SongCard = ({ song }) => {
  const handleViewSong = () => {
    // Redirect to YouTube
    window.open(song.youtubeLink, '_blank');
  };

  return (
    <div className="song-card">
      <div className="song-icon">🎵</div>
      <div className="song-info">
        <h3 className="song-title" onClick={handleViewSong} style={{ cursor: 'pointer' }}>
          {song.title}
          <span className="click-hint"> (Click to listen)</span>
        </h3>
        <h4 className="song-artist">{song.artist}</h4>
        <p className="song-description">{song.description}</p>
        
        {song.tags && song.tags.length > 0 && (
          <div className="song-tags">
            {song.tags.map((tag, index) => (
              <span key={index} className="song-tag">{tag}</span>
            ))}
          </div>
        )}
        
        <p className="song-submitter">
          Submitted by: {song.submittedBy?.username || 'Anonymous'}
        </p>
      </div>
      <div className="song-action">
        <button onClick={handleViewSong} className="view-btn">
          Listen on YouTube
        </button>
      </div>
    </div>
  );
};

// Song Submit Form Component
const SongSubmitForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    description: '',
    youtubeLink: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Submitting song data:', formData);
      const response = await songService.submitSong(formData);
      console.log('Submission response:', response);
      
      if (response.success) {
        alert('Song submitted successfully! Waiting for admin approval.');
        setFormData({
          title: '',
          artist: '',
          description: '',
          youtubeLink: '',
          tags: ''
        });
        onSuccess();
      } else {
        alert(`Failed to submit: ${response.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="song-submit-form">
      <h3>Submit a Revolutionary Song</h3>
      <form className="song-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Song Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter song title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">Artist</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter artist name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Describe the song and its significance to the movement"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="youtubeLink">YouTube Link</label>
          <input
            type="url"
            id="youtubeLink"
            name="youtubeLink"
            value={formData.youtubeLink}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            disabled={loading}
            placeholder="e.g., protest, revolution, freedom (comma-separated)"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-song-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Song'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => onSuccess()}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

// Admin Panel Component
const AdminPanel = ({ songs, onApprove, onReject, onDelete }) => {
  return (
    <div className="admin-panel">
      <h3>Admin Panel - Song Approvals</h3>
      <div className="admin-songs">
        {songs.length > 0 ? (
          songs.map((song) => (
            <div key={song._id} className="admin-song-card">
              <div className="song-info">
                <h4>{song.title} - {song.artist}</h4>
                <p><strong>Status:</strong> {song.status}</p>
                <p><strong>YouTube Link:</strong> <a href={song.youtubeLink} target="_blank" rel="noopener noreferrer">{song.youtubeLink}</a></p>
                <p><strong>Description:</strong> {song.description}</p>
                <p><strong>Submitted by:</strong> {song.submittedBy?.username}</p>
                <p><strong>Date:</strong> {new Date(song.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div className="song-actions">
                {song.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => onApprove(song._id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) onReject(song._id, reason);
                      }}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button 
                  onClick={() => onDelete(song._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No songs to review at this time.</p>
        )}
      </div>
    </div>
  );
};

// Submission Card Component
const SubmissionCard = ({ submission }) => {
  const handleViewSubmission = () => {
    // Only open YouTube for approved submissions
    if (submission.status === 'approved' && submission.youtubeLink) {
      window.open(submission.youtubeLink, '_blank');
    }
  };

  return (
    <div 
      className={`submission-card ${submission.status}`}
      onClick={submission.status === 'approved' ? handleViewSubmission : undefined}
      style={submission.status === 'approved' ? { cursor: 'pointer' } : {}}
    >
      <h4>
        {submission.title}
        {submission.status === 'approved' && (
          <span className="click-hint"> (Click to listen)</span>
        )}
      </h4>
      <p><strong>Status:</strong> {submission.status}</p>
      <p><strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleDateString()}</p>
      {submission.status === 'rejected' && (
        <p><strong>Reason:</strong> {submission.rejectionReason}</p>
      )}
    </div>
  );
};

export default Songs;