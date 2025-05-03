import React from 'react';
import './VideoGallery.css'; // Make sure this path matches your project structure

const videoLinks = [
  {
    title: 'The Black Bear Knight – Short Film',
    url: 'https://www.youtube.com/watch?v=example1',
  },
  {
    title: 'Sword & Lens – Behind the Scenes',
    url: 'https://www.youtube.com/watch?v=example2',
  },
];

const VideoGallery = () => {
  return (
    <div className="video-gallery">
      <h2 className="video-gallery-title">🎥 The Royal Screenings</h2>

      <ul className="video-list">
        {videoLinks.map((video, idx) => (
          <li key={idx}>
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
            >
              {video.title}
            </a>
          </li>
        ))}
      </ul>

      <div className="channel-button-wrapper">
        <a
          href="https://www.youtube.com/@YourChannelHandle"
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