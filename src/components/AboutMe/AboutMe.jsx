import './AboutMe.css';

const AboutMe = () => {
  return (
    <div className="about-container">
      <img className="profile-pic" src="/assets/profile.png" alt="Your Name" />
      <div className="about-content">
        <h2>About Me</h2>
        <p>
          Hi! I’m Sam Vary; a developer, artist, and creative builder. I love making games, painting miniatures, and crafting
          interactive web experiences. Whether it’s writing code, building a portfolio, or printing a knight riding a bear,
          I’m always working on something cool.
        </p>

        <div className="social-links">
          <a href="https://github.com/samuelvary1" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.instagram.com/talented_chip" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://twitter.com/talented_chip" target="_blank" rel="noopener noreferrer">Twitter</a>
          <a href="mailto:samvary@gmail.com">Email</a>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;