import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/Homepage/HomePage";
import About from "./pages/About";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import GlobalStyle from "./styles/GlobalStyles";
import NavBar from "./components/Navbar";
import VideoGallery from "./components/VideoGallery";
import Experience from "./components/Experience/Experience";

const App = () => {
  return (
    <Router>
      <GlobalStyle />
      <NavBar /> {/* ✅ Navbar placed outside Routes to be persistent */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/film" element={<VideoGallery />} />
        <Route path="/experience" element={<Experience />} />
      </Routes>
    </Router>
  );
};

export default App;
