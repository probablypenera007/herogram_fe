import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Poll from './components/Poll';
import PollList from './components/PollList';
import CreatePoll from './components/CreatePoll';
import AuthModal from './components/AuthModal';
import { pollApi } from './utils/pollApi';
import { socketService } from './utils/socket'; // 👈 Don't forget to import this
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

const App: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      pollApi.getCurrentUser()
        .then(user => setUser(user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // ✅ Add this block here
  useEffect(() => {
    const handleConnect = () => {
      console.log("🟢 Connected inside <App />");
    };
    const handleDisconnect = () => {
      console.log("🔴 Disconnected inside <App />");
    };

    socketService.socket.on('connect', handleConnect);
    socketService.socket.on('disconnect', handleDisconnect);

    return () => {
      socketService.socket.off('connect', handleConnect);
      socketService.socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    localStorage.setItem('token', token);
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">Team Polls</h1>
          <div className="auth-container">
            {user ? (
              <>
                <span className="welcome-text">👋 Welcome, <strong>{user.name}</strong></span>
                <div className="auth-actions">
                  {user.role === 'admin' && (
                    <button className="header-button" onClick={() => window.location.href = '/create'}>
                      ➕ Create Poll
                    </button>
                  )}
                  <button className="header-button" onClick={handleLogout}>🚪 Logout</button>
                </div>
              </>
            ) : (
              <button className="header-button" onClick={() => setIsAuthModalOpen(true)}>🔐 Login / Register</button>
            )}
          </div>
        </header>

        {/* 👇 Conditional Routes */}
        {user ? (
          <Routes>
            <Route path="/" element={<PollList />} />
            <Route path="/poll/:id" element={<Poll />} />
            <Route
              path="/create"
              element={
                user.role === 'admin' ? (
                  <CreatePoll />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
};

export default App;