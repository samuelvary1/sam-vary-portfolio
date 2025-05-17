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

      {/* Icons */}
      <div
        className="map-icon miniatures"
        onClick={() => navigate("/miniatures")}
      >
        <img src="/icons/dragon-fire.png" alt="Miniatures" />
        <span className="label">Miniatures</span>
      </div>

      <div className="map-icon writing" onClick={() => navigate("/writing")}>
        <img src="/icons/scribe.png" alt="Writing" />
        <span className="label">Writing</span>
      </div>

      <div
        className="map-icon experience"
        onClick={() => navigate("/experience")}
      >
        <img src="/icons/resume.png" alt="Experience" />
        <span className="label">Experience</span>
      </div>

      <div className="map-icon music" onClick={() => navigate("/music")}>
        <img src="/icons/bard-music.png" alt="Music" />
        <span className="label">Music</span>
      </div>

      <div className="map-icon film" onClick={() => navigate("/film")}>
        <img src="/icons/knight-camera.png" alt="Film" />
        <span className="label">Film</span>
      </div>

      <div className="map-icon chef" onClick={() => navigate("/recipes")}>
        <img src="/icons/chef-recipes.png" alt="Recipes" />
        <span className="label">Recipes</span>
      </div>

      <div className="map-icon artwork" onClick={() => navigate("/artwork")}>
        <img src="/icons/artist.png" alt="Visual Art" />
        <span className="label">Visual Art</span>
      </div>

      <div className="map-icon about" onClick={() => navigate("/about")}>
        <img src="/icons/trumpet.png" alt="About Me" />
        <span className="label">About Me</span>
      </div>

      <div className="map-icon robot" onClick={() => navigate("/llm")}>
        <img src="/icons/medieval-robot.png" alt="AI Project" />
        <span className="label">AI Project</span>
      </div>

      <div
        className="map-icon adventure"
        onClick={() => navigate("/adventure")}
      >
        <img src="/icons/adventurer.png" alt="Adventure Game" />
        <span className="label">Adventure Game</span>
      </div>
    </div>
  );
};

export default HomePage;
