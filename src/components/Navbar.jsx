import { Link } from "react-router-dom";
import styled from "styled-components";

export const NAV_HEIGHT = 64; // px

const Navbar = () => {
  return (
    <Nav>
      <NavContainer>
        <Logo to="/">Sam Vary</Logo>
        <NavLinks>
          <NavItem to="/miniatures">Miniatures</NavItem>
          <NavItem to="/writing">Writing</NavItem>
          <NavItem to="/artwork">Visual Art</NavItem>
          <NavItem to="/experience">Experience</NavItem>
          <NavItem to="/adventure">Adventure Game</NavItem>
          <NavItem to="/recipes">Recipes</NavItem>
          <NavItem to="/music">Music</NavItem>
          <NavItem to="/film">Film</NavItem>
          <NavItem to="/llm">AI Project</NavItem>
          <NavItem to="/about">About Me</NavItem>
          <NavItem to="/sawyer">Crypto Projects</NavItem>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

/** Use this directly under <Navbar /> to reserve space on pages with a fixed nav */
export const NavSpacer = styled.div`
  height: ${NAV_HEIGHT}px;
`;

const Nav = styled.nav`
  width: 100%;
  padding: 18px 20px; /* was 15px 20px */
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  gap: 12px; /* optional */
`;

const Logo = styled(Link)`
  font-size: 28px;
  font-weight: bold;
  color: #f0f0f0;
  text-decoration: none;
  letter-spacing: 1px;
  white-space: nowrap;

  &:hover {
    color: #ffd700;
  }
`;

const NavLinks = styled.div`
  display: flex;
  flex: 1; /* take remaining space */
  justify-content: flex-end;
  min-width: 0; /* <-- critical for scrolling inside flex */
  flex-wrap: nowrap;
  gap: 15px;
  overflow-x: auto; /* scroll horizontally if needed */
  white-space: nowrap;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const NavItem = styled(Link)`
  color: #f8f8f8;
  text-decoration: none;
  font-size: 16px;
  padding: 8px 10px; /* was 5px 10px */
  border-radius: 6px;
  line-height: 1.4; /* helps center text vertically */
  transition: 0.3s ease-in-out;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffd700;
  }
`;
