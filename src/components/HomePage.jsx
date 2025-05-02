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
        <span className="label">Miniatures</span>
      </div>

      {/* The Scriptorium - Drawing Gallery */}
      <div className="map-icon scriptorium" onClick={() => navigate('/gallery')}>
        <img src="/icons/scribe.png" alt="The Scriptorium" />
        <span className="label">Art Gallery</span>
      </div>

      {/* Experience - Resume and GitHub */}
      <div className="map-icon experience" onClick={() => navigate('/experience')}>
        <img src="/icons/resume.png" alt="Experience" />
        <span className="label">Experience</span>
      </div>

      {/* Music - Basement Tapes */}
      <div className="map-icon music" onClick={() => navigate('/music')}>
        <img src="/icons/bard-music.png" alt="Music" />
        <span className="label">Music</span>
      </div>

      {/* Filmmaking - YouTube and Vimeo */}
      <div className="map-icon film" onClick={() => navigate('/filmmaking')}>
        <img src="/icons/knight-camera.png" alt="Filmmaking" />
        <span className="label">Filmmaking</span>
      </div>

      {/* Recipes & Cooking */}
      <div className="map-icon chef" onClick={() => navigate('/cooking')}>
        <img src="/icons/chef-recipes.png" alt="Cooking" />
        <span className="label">Recipes</span>
      </div>
    </div>
  );
};

export default HomePage;