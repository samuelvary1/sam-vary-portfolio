import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Walkthroughs.css";

const Walkthroughs = () => {
  const [walkthroughs, setWalkthroughs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");

  useEffect(() => {
    fetchWalkthroughs();
  }, []);

  const fetchWalkthroughs = async () => {
    try {
      // This will load from a data file we'll create
      const response = await fetch("/data/walkthroughs/index.json");
      const data = await response.json();
      setWalkthroughs(data.walkthroughs || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading walkthroughs:", error);
      // Fallback data
      setWalkthroughs([
        {
          id: "kings-quest-1",
          title: "King's Quest I: Quest for the Crown",
          subtitle: "The Original Fantasy Adventure",
          genre: "Fantasy Adventure",
          year: 1984,
          difficulty: "Intermediate",
          thumbnail: "/assets/walkthroughs/placeholder.png",
          description:
            "Guide Sir Graham through his quest to become king of Daventry.",
          chapters: [
            "Getting Started",
            "The Three Treasures",
            "Magic Mirror Quest",
            "Becoming King",
          ],
          estimatedTime: "4-6 hours",
          lastUpdated: "2024-11-04",
        },
        {
          id: "monkey-island-1",
          title: "The Secret of Monkey Island",
          subtitle: "The Pirate Adventure Classic",
          genre: "Point & Click Adventure",
          year: 1990,
          difficulty: "Beginner",
          thumbnail: "/assets/walkthroughs/placeholder.png",
          description:
            "Guide Guybrush Threepwood through his quest to become a mighty pirate.",
          chapters: [
            "Part I: The Three Trials",
            "Part II: The Journey",
            "Part III: Under Monkey Island",
            "Part IV: Guybrush Kicks Butt",
          ],
          estimatedTime: "8-12 hours",
          lastUpdated: "2024-11-04",
        },
        {
          id: "grim-fandango",
          title: "Grim Fandango",
          subtitle: "Film Noir Meets Day of the Dead",
          genre: "Film Noir Adventure",
          year: 1998,
          difficulty: "Advanced",
          thumbnail: "/assets/walkthroughs/placeholder.png",
          description:
            "Guide Manny Calavera through the Land of the Dead in this artistic triumph.",
          chapters: [
            "Year One: The DOD",
            "Year Two: Rubacava",
            "Year Three: The Petrified Forest",
            "Year Four: Edge of the World",
          ],
          estimatedTime: "12-18 hours",
          lastUpdated: "2024-11-04",
        },
      ]);
      setLoading(false);
    }
  };

  const filteredWalkthroughs = walkthroughs.filter((walkthrough) => {
    const matchesSearch =
      walkthrough.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      walkthrough.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre =
      selectedGenre === "all" || walkthrough.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ["all", ...new Set(walkthroughs.map((w) => w.genre))];

  if (loading) {
    return (
      <div className="walkthroughs-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading adventure walkthroughs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="walkthroughs-container">
      <Link to="/" className="walkthroughs-back-button">
        ← Back to Homepage
      </Link>

      <div className="walkthroughs-content">
        <div className="walkthroughs-header">
          <div className="header-content">
            <h1 className="walkthroughs-title">Adventure Game Walkthroughs</h1>
            <p className="walkthroughs-subtitle">
              Complete guides, tips, and solutions for classic adventure games
            </p>
          </div>
          <div className="header-illustration">
            <div className="adventure-icon">🗺️</div>
          </div>
        </div>

        <div className="walkthroughs-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search walkthroughs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-section">
            <label htmlFor="genre-select">Filter by Genre:</label>
            <select
              id="genre-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="genre-select"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === "all" ? "All Genres" : genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="walkthroughs-grid">
          {filteredWalkthroughs.length === 0 ? (
            <div className="no-results">
              <p>No walkthroughs found matching your criteria.</p>
              <p>Try adjusting your search or filter settings.</p>
            </div>
          ) : (
            filteredWalkthroughs.map((walkthrough) => (
              <div key={walkthrough.id} className="walkthrough-card">
                <div className="walkthrough-thumbnail">
                  <div className="thumbnail-placeholder">
                    <div className="game-icon">🎮</div>
                    <div className="game-year">{walkthrough.year}</div>
                  </div>
                  <div className="difficulty-badge">
                    {walkthrough.difficulty}
                  </div>
                </div>

                <div className="walkthrough-info">
                  <div className="walkthrough-meta">
                    <span className="year">{walkthrough.year}</span>
                    <span className="genre">{walkthrough.genre}</span>
                  </div>

                  <h3 className="walkthrough-title">{walkthrough.title}</h3>
                  <p className="walkthrough-subtitle">{walkthrough.subtitle}</p>
                  <p className="walkthrough-description">
                    {walkthrough.description}
                  </p>

                  <div className="walkthrough-details">
                    <div className="chapters-info">
                      <strong>Chapters:</strong> {walkthrough.chapters.length}
                    </div>
                    <div className="time-info">
                      <strong>Est. Time:</strong> {walkthrough.estimatedTime}
                    </div>
                  </div>

                  <div className="walkthrough-actions">
                    <Link
                      to={`/walkthroughs/${walkthrough.id}`}
                      className="view-walkthrough-btn"
                    >
                      View Walkthrough
                    </Link>
                    <span className="last-updated">
                      Updated:{" "}
                      {new Date(walkthrough.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="walkthroughs-footer">
          <div className="footer-content">
            <h3>About These Walkthroughs</h3>
            <p>
              These walkthroughs are comprehensive guides designed to help you
              experience classic adventure games to their fullest. Each guide
              includes detailed step-by-step instructions, puzzle solutions, and
              strategic tips.
            </p>
            <p>
              All walkthroughs respect the original game experience while
              providing the help you need to overcome challenging puzzles and
              enjoy the story.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Walkthroughs;
