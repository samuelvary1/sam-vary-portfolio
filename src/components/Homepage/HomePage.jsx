import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="map-wrapper">
      <img
        src="/assets/fantasy-map.png"
        alt="Fantasy Map"
        className="map-background"
      />

      <div className="hero-name">
        <h1>Sam C. Vary</h1>
      </div>

      {/* Icons Grid */}
      <div className="icon-grid">
        <div
          className="map-icon miniatures"
          onClick={() => navigate("/miniatures")}
        >
          <div className="icon-bg">
            <img src="/icons/dragon-fire.png" alt="Miniatures" />
          </div>
          <span className="label">Miniatures</span>
        </div>

        <div className="map-icon writing" onClick={() => navigate("/writing")}>
          <div className="icon-bg">
            <img src="/icons/scribe.png" alt="Writing" />
          </div>
          <span className="label">Writing</span>
        </div>

        <div
          className="map-icon experience"
          onClick={() => navigate("/experience")}
        >
          <div className="icon-bg">
            <img src="/icons/resume.png" alt="Experience" />
          </div>
          <span className="label">Experience</span>
        </div>

        <div className="map-icon music" onClick={() => navigate("/music")}>
          <div className="icon-bg">
            <img src="/icons/bard-music.png" alt="Music" />
          </div>
          <span className="label">Music</span>
        </div>

        <div className="map-icon film" onClick={() => navigate("/film")}>
          <div className="icon-bg">
            <img src="/icons/knight-camera.png" alt="Film" />
          </div>
          <span className="label">Film</span>
        </div>

        <div className="map-icon chef" onClick={() => navigate("/recipes")}>
          <div className="icon-bg">
            <img src="/icons/chef-recipes.png" alt="Recipes" />
          </div>
          <span className="label">Recipes</span>
        </div>

        <div className="map-icon artwork" onClick={() => navigate("/artwork")}>
          <div className="icon-bg">
            <img src="/icons/artist.png" alt="Visual Art" />
          </div>
          <span className="label">Visual Art</span>
        </div>

        <div className="map-icon about" onClick={() => navigate("/about")}>
          <div className="icon-bg">
            <img src="/icons/trumpet.png" alt="About Me" />
          </div>
          <span className="label">About Me</span>
        </div>

        <div className="map-icon robot" onClick={() => navigate("/llm")}>
          <div className="icon-bg">
            <img src="/icons/medieval-robot.png" alt="AI Project" />
          </div>
          <span className="label">AI Project</span>
        </div>

        <div
          className="map-icon adventure"
          onClick={() => navigate("/adventure")}
        >
          <div className="icon-bg">
            <img src="/icons/adventurer.png" alt="Adventure Game" />
          </div>
          <span className="label">Adventure Game</span>
        </div>

        <div className="map-icon sawyer" onClick={() => navigate("/sawyer")}>
          <div className="icon-bg">
            <img src="/icons/sawyer-logo.png" alt="Sawyer Token Project" />
          </div>
          <span className="label">Sawyer Token</span>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
