import React from "react";
import "./VideoGallery.css";

const videoLinks = [
  {
    title: "Darkpine's Wood",
    description: "Short fantasy film",
    url: "https://vimeo.com/335623315",
  },
  {
    title: "The Ballad of a Young Thief",
    description: "Russian gangster film",
    url: "https://vimeo.com/335582663",
  },
  {
    title: "Night Surf",
    description: "Stephen King short story adaptation",
    url: "https://vimeo.com/335615900",
  },
  {
    title: "Afterlife",
    description: "Hand-drawn animation film",
    url: "https://vimeo.com/73181633",
  },
  {
    title: "Southern Belle by Elliott Smith",
    description: "Music video",
    url: "https://youtu.be/tXLyRq6-pcA",
  },
  {
    title: "Interview with Pavel Datsyuk",
    description: "Self-produced interview with NHL legend",
    url: "https://youtu.be/m8XiZ08fyUo",
  },
  {
    title: "The Box",
    description: "Short mystery film",
    url: "https://vimeo.com/335583154",
  },
];

const VideoGallery = () => {
  return (
    <div className="video-gallery">
      <h2 className="video-gallery-title">🎥 Filmography</h2>

      <ul className="video-list">
        {videoLinks.map((video, idx) => (
          <li key={idx}>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
            >
              <strong>{video.title}</strong>
              <div className="video-description">{video.description}</div>
            </a>
          </li>
        ))}
      </ul>

      <div className="channel-button-wrapper">
        <a
          href="https://www.youtube.com/@talentedchip2124"
          target="_blank"
          rel="noopener noreferrer"
          className="channel-button"
        >
          📺 Visit My YouTube Channel
        </a>
      </div>
    </div>
  );
};

export default VideoGallery;
