import React, { useState, useRef } from "react";
import { musicTracks } from "../../data/tracks";
import "./MusicGallery.css";

const MusicGallery = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRefs = useRef([]);

  const togglePlay = (index) => {
    const audio = audioRefs.current[index];

    if (audio.paused) {
      // Pause all others
      audioRefs.current.forEach((a, i) => {
        if (i !== index) a.pause();
      });
      audio.play();
      setCurrentTrack(index);
    } else {
      audio.pause();
      setCurrentTrack(null);
    }
  };

  return (
    <div className="music-gallery">
      {musicTracks.map((track, index) => (
        <div className="track-card" key={track.file}>
          <h3>{track.title}</h3>
          <button onClick={() => togglePlay(index)}>
            {currentTrack === index ? "Pause" : "Play"}
          </button>
          <audio
            ref={(el) => (audioRefs.current[index] = el)}
            src={track.file}
          />
        </div>
      ))}
    </div>
  );
};

export default MusicGallery;
