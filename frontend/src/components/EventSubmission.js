import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './EventSubmission.css';

const EventSubmission = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'protest',
    date: '',
    location: '',
    tags: '',
    sources: '',
    casualties: 0,
    injured: 0
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  const user = authService.getCurrentUser();
  if (!user) {
    navigate('/login');
    return null;
  }

  const eventTypes = [
    { value: 'protest', label: '✊ Protest' },
    { value: 'arrest', label: '🚔 Arrest' },
    { value: 'martyrdom', label: '💔 Martyrdom' },
    { value: 'statement', label: '📢 Statement' },
    { value: 'meeting', label: '🤝 Meeting' },
    { value: 'violence', label: '⚠️ Violence' },
    { value: 'other', label: '📝 Other' }
  ];

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 5 images
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    const previews = [];

    files.forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({
          file: file,
          url: e.target.result,
          name: file.name
        });
        
        if (previews.length === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages(validFiles);
    if (error && validFiles.length > 0) setError('');
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
      return false;
    }
    if (!formData.date) {
      setError('Event date is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Event location is required');
      return false;
    }
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setError('');
      setLoading(true);

      const user = authService.getCurrentUser();

      if (selectedImages.length > 0) {
        // If there are images, use FormData
        const submitData = new FormData();
        
        // Add form fields
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('eventType', formData.eventType);
        submitData.append('date', formData.date);
        submitData.append('location', formData.location);
        submitData.append('tags', formData.tags);
        submitData.append('sources', formData.sources);
        submitData.append('casualties', formData.casualties);
        submitData.append('injured', formData.injured);

        // Add images
        selectedImages.forEach(image => {
          submitData.append('images', image);
        });

        // Submit with FormData
        const response = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
            // Don't set Content-Type for FormData - browser sets it automatically
          },
          body: submitData
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit event');
        }

      } else {
        // If no images, use regular JSON submission
        const submitData = {
          title: formData.title,
          description: formData.description,
          eventType: formData.eventType,
          date: formData.date,
          location: formData.location,
          tags: formData.tags,
          sources: formData.sources,
          casualties: parseInt(formData.casualties) || 0,
          injured: parseInt(formData.injured) || 0
        };

        const response = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to submit event');
        }
      }

      setSuccess('Event submitted successfully! 🎉 Redirecting to timeline...');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        eventType: 'protest',
        date: '',
        location: '',
        tags: '',
        sources: '',
        casualties: 0,
        injured: 0
      });
      setSelectedImages([]);
      setImagePreviews([]);

      // Redirect to timeline after 2 seconds
      setTimeout(() => {
        navigate('/timeline');
      }, 2000);

    } catch (error) {
      setError(error.message || 'Failed to submit event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-submission-container">
      {/* Navigation */}
      <div className="nav-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          ← Back to Dashboard
        </button>
        <h2>July Archive</h2>
        <span>Hello, {user?.user?.username}!</span>
      </div>

      <div className="event-submission-card">
        <div className="submission-header">
          <h1>📋 Submit July Event</h1>
          <p>Document important events from the July movement with images</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={onSubmit} className="event-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onChange}
                placeholder="e.g., Student protest at Shahbagh"
                required
                disabled={loading}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventType">Event Type *</label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={onChange}
                required
                disabled={loading}
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Event Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={onChange}
              placeholder="Describe what happened in detail..."
              required
              disabled={loading}
              rows={4}
              maxLength={2000}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Event Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={onChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onChange}
                placeholder="e.g., Shahbagh, Dhaka"
                required
                disabled={loading}
                maxLength={200}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="form-group">
            <label htmlFor="images">📸 Event Images (Optional)</label>
            <input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={loading}
              className="file-input"
            />
            <div className="file-input-help">
              Upload up to 5 images (max 10MB each). Supported formats: JPG, PNG, GIF
            </div>
          </div>

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="image-previews">
              <h4>📷 Selected Images ({imagePreviews.length}/5)</h4>
              <div className="preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="preview-item">
                    <img 
                      src={preview.url} 
                      alt={`Preview ${index + 1}`}
                      className="preview-image"
                    />
                    <div className="preview-info">
                      <span className="image-name">{preview.name}</span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="remove-image-btn"
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={onChange}
              placeholder="e.g., student, quota, reform (comma-separated)"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="casualties">Casualties</label>
              <input
                type="number"
                id="casualties"
                name="casualties"
                value={formData.casualties}
                onChange={onChange}
                min="0"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="injured">Injured</label>
              <input
                type="number"
                id="injured"
                name="injured"
                value={formData.injured}
                onChange={onChange}
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sources">Sources</label>
            <input
              type="text"
              id="sources"
              name="sources"
              value={formData.sources}
              onChange={onChange}
              placeholder="e.g., BBC News, Prothom Alo (comma-separated)"
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? '📤 Submitting...' : '📤 Submit Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventSubmission;