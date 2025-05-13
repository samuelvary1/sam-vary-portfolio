import React, { useState, useEffect } from 'react';
import './MiniaturesGallery.css';

const photos = [
  "argofront1.jpeg", "bilbo.jpeg", "blunderbus.jpeg", "chess_bis_black.jpeg", "chess_castle_black.jpeg",
  "chess_king_black.jpeg", "chess_king_white.jpeg", "chess_knight_black.jpeg", "chess_knight_white.jpeg",
  "chess_pawn_black.jpeg", "chess_pawn_white.jpeg", "chess_queen_black.jpeg", "gordon_freeman.jpeg",
  "guybrush.jpeg", "IMG_4470.jpeg", "IMG_4472.jpeg", "IMG_4473.jpeg", "IMG_4474.jpeg", "IMG_4486.jpeg",
  "IMG_4487.jpeg", "IMG_4489.jpeg", "IMG_4490.jpeg", "IMG_4580.jpeg", "IMG_4649.jpeg", "IMG_4658.jpeg",
  "IMG_4676.jpeg", "IMG_4914.jpeg", "IMG_4933.mov", "IMG_4936.jpeg", "IMG_4941.jpeg", "IMG_4944.jpeg",
  "IMG_4945.jpeg", "IMG_4946.jpeg", "IMG_4952.jpeg", "IMG_4990.jpeg", "IMG_4991.jpeg", "IMG_4994.jpeg",
  "IMG_5015.jpeg", "IMG_5018.jpeg", "IMG_5019.jpeg", "IMG_5020.jpeg", "IMG_5021.jpeg", "IMG_5022.jpeg",
  "IMG_5023.jpeg", "IMG_5024.jpeg", "IMG_5025.jpeg", "IMG_5026.jpeg", "IMG_5038.jpeg", "IMG_5086.jpeg",
  "IMG_5088.jpeg", "IMG_5165.jpeg", "IMG_5206.jpeg", "IMG_5207.jpeg", "IMG_5227.jpeg", "IMG_5243.jpeg",
  "IMG_5244.jpeg", "IMG_5249.jpeg", "IMG_5330.jpeg", "IMG_5338.jpeg", "IMG_5342.jpeg", "IMG_5355.jpeg",
  "IMG_5356.jpeg", "IMG_5412.jpeg", "IMG_5421.jpeg", "IMG_5422.jpeg", "IMG_5450.jpeg", "IMG_5498.jpeg",
  "IMG_5514.jpeg", "IMG_5515.jpeg", "IMG_5520.jpeg", "IMG_5541.jpeg", "IMG_5657.jpeg", "IMG_5672.jpeg",
  "IMG_5699.jpeg", "IMG_5770.jpeg", "IMG_5859.jpeg", "IMG_5860.jpeg", "IMG_5919.jpeg", "IMG_5920.jpeg",
  "IMG_5921.jpeg", "IMG_5925.jpeg", "IMG_5940.jpeg", "IMG_6154.jpeg", "IMG_6155.jpeg", "IMG_6159.jpeg",
  "IMG_6164.jpeg", "IMG_6196.jpeg", "IMG_6197.mov", "IMG_6198.mov", "IMG_6199.jpeg", "IMG_6212.jpeg",
  "IMG_6214.jpeg", "IMG_6379.jpeg", "IMG_6759.jpeg", "IMG_6762.jpeg", "IMG_6821.jpeg", "IMG_6878.jpeg",
  "IMG_8792.jpeg", "IMG_8793.jpeg", "killa2.jpeg", "lechuck.jpeg"
];

const MiniaturesGallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const showNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === 'ArrowLeft') showPrev(e);
        if (e.key === 'ArrowRight') showNext(e);
        if (e.key === 'Escape') closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  return (
    <div className="gallery-container">
      {photos.map((file, index) => (
        <div className="photo-card" key={index}>
          {file.endsWith('.mov') ? (
            <video controls className="media" src={`/assets/Miniatures/${file}`} />
          ) : (
            <img
              className="media zoom"
              src={`/assets/Miniatures/${file}`}
              alt={file.replace(/\.(jpeg|mov)/, '')}
              onClick={() => openLightbox(index)}
            />
          )}
          <p className="caption">{file.replace(/\.(jpeg|mov)/, '')}</p>
        </div>
      ))}

      {lightboxIndex !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-arrow left" onClick={showPrev}>&#10094;</button>
          {photos[lightboxIndex].endsWith('.mov') ? (
            <video controls autoPlay src={`/assets/Miniatures/${photos[lightboxIndex]}`} />
          ) : (
            <img src={`/assets/Miniatures/${photos[lightboxIndex]}`} alt="Lightbox" />
          )}
          <button className="lightbox-arrow right" onClick={showNext}>&#10095;</button>
        </div>
      )}
    </div>
  );
};

export default MiniaturesGallery;
