import { Link } from "react-router-dom";
import styled from "styled-components";

export const NAV_HEIGHT = 64; // px

const Navbar = () => {
  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <img src="/guitar_icon.png" alt="Guitar icon" />
          Sam Vary
        </Logo>

        {/* Reordered to group Creative Work, Projects, and About/CV */}
        <NavLinks>
          {/* Creative work */}
          <NavItem to="/film">Film</NavItem>
          <NavItem to="/artwork">Visual Art</NavItem>
          <NavItem to="/writing">Writing</NavItem>
          <NavItem to="/music">Music</NavItem>
          <NavItem to="/miniatures">Miniatures</NavItem>

          {/* Projects */}
          <NavItem to="/adventure">Adventure Game</NavItem>
          <NavItem to="/llm">AI Project</NavItem>
          <NavItem to="/crypto">Crypto Projects</NavItem>

          {/* Personal / CV */}
          <NavItem to="/recipes">Recipes</NavItem>
          <NavItem to="/experience">Experience</NavItem>
          <NavItem to="/about">About Me</NavItem>
          <NavItem to="/sports">Sports</NavItem>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

export const NavSpacer = styled.div`
  height: ${NAV_HEIGHT}px;
`;

const Nav = styled.nav`
  width: 100%;
  padding: 18px 20px;
  background: url("/assets/blue-marble.png");
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  font-family: "MedievalSharp", cursive;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
`;

const NavContainer = styled.div`
  display: block; /* stack logo and links */
  text-align: center; /* center everything */
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  display: inline-flex; /* inline-flex to align image + text */
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  color: #f0f0f0;
  text-decoration: none;
  letter-spacing: 1px;
  white-space: nowrap;
  margin-bottom: 12px; /* space between logo and nav links */
  gap: 10px;

  img {
    height: 32px; /* adjust as needed */
    width: auto;
    display: inline-block;
  }

  &:hover {
    color: #ffd700;
  }
`;

const NavLinks = styled.div`
  display: inline-flex;
  justify-content: center;
  flex-wrap: nowrap;
  gap: clamp(8px, 1.2vw, 15px);

  overflow-x: auto;
  padding: 0 16px;
  scroll-behavior: smooth;
  scrollbar-gutter: stable both-edges;

  white-space: nowrap;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.25);
    border-radius: 999px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
`;

const NavItem = styled(Link)`
  color: #f8f8f8;
  text-decoration: none;
  font-size: clamp(14px, 1.05vw, 16px);
  padding: 8px 10px;
  border-radius: 6px;
  line-height: 1.4;
  transition: 0.3s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffd700;
  }
`;
