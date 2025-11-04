import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import HomePage from "./components/Homepage/HomePage";
import AboutMe from "./components/AboutMe/AboutMe";
import Contact from "./pages/Contact";
import GlobalStyle from "./styles/GlobalStyles";
import Navbar, { NavSpacer } from "./components/Navbar";
import VideoGallery from "./components/VideoGallery/VideoGallery";
import MiniaturesGallery from "./components/Miniatures/MiniaturesGallery";
import Experience from "./components/Experience/Experience";
import AskTheOracle from "./components/LLM/AskTheOracle";
import GamePage from "./components/FieldsOfPeril/GamePage";
import MusicGallery from "./components/MusicGallery/MusicGallery";
import DrawingsGallery from "./components/DrawingsGallery/DrawingsGallery";
import RecipesList from "./components/Recipes/RecipesList";
import RecipePage from "./components/Recipes/RecipePage";
import WritingList from "./components/Writing/WritingList";
import WritingPage from "./components/Writing/WritingPage";
import CryptoProjects from "./components/CryptoProjects/CryptoProjects";
import Sports from "./components/Sports/Sports";
import Mets from "./components/Sports/Mets";
import Rangers from "./components/Sports/Rangers";
import Walkthroughs from "./components/Walkthroughs/Walkthroughs";
import WalkthroughPage from "./components/Walkthroughs/WalkthroughPage";

// Create a wrapper to use hooks like useLocation inside Router
const AppWrapper = () => {
  const location = useLocation();
  const hideNav = location.pathname === "/";

  return (
    <>
      <GlobalStyle />
      {!hideNav && <Navbar />}
      {!hideNav && <NavSpacer />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutMe />} />
        <Route path="/miniatures" element={<MiniaturesGallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/film" element={<VideoGallery />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/llm" element={<AskTheOracle />} />
        <Route path="/adventure" element={<GamePage />} />
        <Route path="/music" element={<MusicGallery />} />
        <Route path="/artwork" element={<DrawingsGallery />} />
        <Route path="/recipes" element={<RecipesList />} />
        <Route path="/recipes/:slug" element={<RecipePage />} />
        <Route path="/writing" element={<WritingList />} />
        <Route path="/writing/:slug" element={<WritingPage />} />
        <Route path="/crypto" element={<CryptoProjects />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/mets" element={<Mets />} />
        <Route path="/sports/rangers" element={<Rangers />} />
        <Route path="/walkthroughs" element={<Walkthroughs />} />
        <Route path="/walkthroughs/:id" element={<WalkthroughPage />} />
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
