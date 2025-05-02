import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    
    <div className="map-wrapper">
      <img src="/assets/fantasy-map.png" alt="Fantasy Map" className="map-background" />

      <div className="hero-name">
        <h1>Samuel (Sam) Vary</h1>
      </div>

      {/* The Forge - Miniatures */}
      <div className="map-icon forge" onClick={() => navigate('/miniatures')}>
        <img src="/icons/dragon-fire.png" alt="The Forge" />
        <span className="label">The Forge</span>
      </div>

      {/* The Scriptorium - Drawing Gallery */}
      <div className="map-icon scriptorium" onClick={() => navigate('/gallery')}>
        <img src="/icons/scribe.png" alt="The Scriptorium" />
        <span className="label">The Scriptorium</span>
      </div>

      {/* Add other locations here... */}

      {/* Experience - Resume and GitHub */}
      <div className="map-icon experience" onClick={() => navigate('/experience')}>
        <img src="/icons/resume.png" alt="Experience" />
        <span className="label">Experience</span>
      </div>
    </div>
  );
};

export default HomePage;