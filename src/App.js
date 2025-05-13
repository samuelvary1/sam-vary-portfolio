import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./components/Homepage/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GlobalStyle from "./styles/GlobalStyles";
import NavBar from "./components/Navbar";
import VideoGallery from "./components/VideoGallery/VideoGallery";
import MiniaturesGallery from "./components/Miniatures/MiniaturesGallery";
import Experience from "./components/Experience/Experience";
import AskTheOracle from "./components/LLM/AskTheOracle";

// Create a wrapper to use hooks like useLocation inside Router
const AppWrapper = () => {
  const location = useLocation();
  const hideNav = location.pathname === "/";

  return (
    <>
      <GlobalStyle />
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/miniatures" element={<MiniaturesGallery />} />        
        <Route path="/contact" element={<Contact />} />
        <Route path="/film" element={<VideoGallery />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/llm" element={<AskTheOracle />} />
      </Routes>
    </>
  );
};

const App = () => (
  <Router>
    <AppWrapper />
  </Router>
);

export default App;