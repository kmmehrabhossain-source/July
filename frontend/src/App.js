import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import authService from './services/authService';
import EventSubmission from './components/EventSubmission';
import EventTimeline from './components/EventTimeline';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Martyrs from './components/Martyrs';
import Songs from './components/Songs';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/martyrs" element={<Martyrs />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/timeline" element={<EventTimeline />} />
          <Route path="/submit-event" element={<EventSubmission />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;