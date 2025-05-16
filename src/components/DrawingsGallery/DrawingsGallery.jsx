import React, { useState, useEffect } from "react";
import { drawings } from "../../data/drawings";
import "./DrawingsGallery.css";

const DrawingsGallery = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev + 1) % drawings.length);
      } else if (e.key === "ArrowLeft") {
        setSelectedIndex(
          (prev) => (prev - 1 + drawings.length) % drawings.length,
        );
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  return (
    <div className="drawings-gallery">
      {drawings.map((drawing, index) => (
        <div
          className="drawing-card"
          key={index}
          onClick={() => setSelectedIndex(index)}
        >
          <img src={drawing.file} alt={drawing.title} />
          <h3>{drawing.title}</h3>
        </div>
      ))}

      {selectedIndex !== null && (
        <div className="lightbox" onClick={() => setSelectedIndex(null)}>
          <button
            className="lightbox-close"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
          >
            ✕
          </button>
          <button
            className="lightbox-arrow left"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(
                (prev) => (prev - 1 + drawings.length) % drawings.length,
              );
            }}
          >
            ‹
          </button>
          <img
            src={drawings[selectedIndex].file}
            alt={drawings[selectedIndex].title}
            className="lightbox-img"
          />
          <button
            className="lightbox-arrow right"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((prev) => (prev + 1) % drawings.length);
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawingsGallery;
