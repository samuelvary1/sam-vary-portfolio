import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLanding.css";

export default function AdminLanding() {
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleGoalsClick = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
    setPassword("");
    setError("");
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    // Navigate with the password as the key query parameter
    navigate(`/admin/progress?key=${password}`);
  };

  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setSelectedUser(null);
    setPassword("");
    setError("");
  };

  return (
    <div className="admin-landing">
      <div className="admin-landing-container">
        <div className="admin-header">
          <h1>🔐 Admin Portal</h1>
          <p className="admin-subtitle">Sam Vary's Dashboard</p>
        </div>

        <div className="admin-cards">
          <div className="admin-card" onClick={() => handleGoalsClick("Sam")}>
            <div className="admin-card-icon">🎯</div>
            <h2>Sam's Goals</h2>
            <p>Track 2025-2026 personal goals and milestones</p>
            <div className="admin-card-arrow">→</div>
          </div>

          <div
            className="admin-card"
            onClick={() => handleGoalsClick("Antoin")}
          >
            <div className="admin-card-icon">🔥</div>
            <h2>Antoin's Goals</h2>
            <p>Track weekly fitness and reading streaks</p>
            <div className="admin-card-arrow">→</div>
          </div>

          <div className="admin-card disabled">
            <div className="admin-card-icon">📊</div>
            <h2>Analytics</h2>
            <p>Coming soon</p>
            <div className="admin-card-lock">🔒</div>
          </div>

          <div className="admin-card disabled">
            <div className="admin-card-icon">⚙️</div>
            <h2>Site Settings</h2>
            <p>Coming soon</p>
            <div className="admin-card-lock">🔒</div>
          </div>
        </div>

        <div className="admin-footer">
          <button className="back-button" onClick={() => navigate("/")}>
            ← Back to Site
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            <h2>Enter Password</h2>
            <p className="modal-subtitle">
              Access {selectedUser}'s Goals Dashboard
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />

              {error && <div className="error-message">{error}</div>}

              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Continue →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
