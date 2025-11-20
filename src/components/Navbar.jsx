import { Link } from "react-router-dom";
import styled from "styled-components";
import { useState } from "react";

export const NAV_HEIGHT = 56; // px - mobile height
export const NAV_HEIGHT_DESKTOP = 90; // px - desktop height

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <Nav>
      <NavContainer>
        <LogoAndToggle>
          <Logo to="/" onClick={closeMenu}>
            <img src="/guitar_icon.png" alt="Guitar icon" />
            Sam Vary
          </Logo>
          <MobileMenuToggle onClick={toggleMenu} $isOpen={isMenuOpen}>
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuToggle>
        </LogoAndToggle>

        <NavLinks $isOpen={isMenuOpen}>
          {/* Creative work */}
          <NavItem to="/film" onClick={closeMenu}>
            Film
          </NavItem>
          <NavItem to="/artwork" onClick={closeMenu}>
            Drawings
          </NavItem>
          <NavItem to="/writing" onClick={closeMenu}>
            Writing
          </NavItem>
          <NavItem to="/music" onClick={closeMenu}>
            Music
          </NavItem>
          <NavItem to="/miniatures" onClick={closeMenu}>
            Miniatures
          </NavItem>
          <NavItem to="/walkthroughs" onClick={closeMenu}>
            Walkthroughs
          </NavItem>
          <NavItem to="/llm" onClick={closeMenu}>
            Oracle
          </NavItem>
          <NavItem to="/crypto" onClick={closeMenu}>
            Crypto
          </NavItem>

          {/* Personal / CV */}
          <NavItem to="/recipes" onClick={closeMenu}>
            Recipes
          </NavItem>
          <NavItem to="/experience" onClick={closeMenu}>
            Experience
          </NavItem>
          <NavItem to="/about" onClick={closeMenu}>
            About
          </NavItem>
          <NavItem to="/sports" onClick={closeMenu}>
            Sports
          </NavItem>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

export const NavSpacer = styled.div`
  height: ${NAV_HEIGHT}px;

  @media (min-width: 768px) {
    height: ${NAV_HEIGHT_DESKTOP}px;
  }
`;

const Nav = styled.nav`
  width: 100%;
  padding: 12px 16px;
  background: url("/assets/blue-marble.png");
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  font-family: "MedievalSharp", cursive;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);

  @media (min-width: 768px) {
    padding: 18px 20px;
  }
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media (min-width: 768px) {
    display: block;
    text-align: center;
  }
`;

const LogoAndToggle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (min-width: 768px) {
    justify-content: center;
    flex-direction: column;
    gap: 12px;
  }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
  color: #f0f0f0;
  text-decoration: none;
  letter-spacing: 1px;
  white-space: nowrap;
  gap: 8px;

  img {
    height: 24px;
    width: auto;
    display: block;
  }

  &:hover {
    color: #ffd700;
  }

  @media (min-width: 768px) {
    font-size: 28px;
    gap: 10px;
    justify-content: center;

    img {
      height: 32px;
    }
  }
`;

const MobileMenuToggle = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;

  span {
    width: 24px;
    height: 2px;
    background: #f0f0f0;
    border-radius: 1px;
    transition: all 0.3s linear;
    transform-origin: 1px;

    &:first-child {
      transform: ${({ $isOpen }) => ($isOpen ? "rotate(45deg)" : "rotate(0)")};
    }

    &:nth-child(2) {
      opacity: ${({ $isOpen }) => ($isOpen ? "0" : "1")};
      transform: ${({ $isOpen }) =>
        $isOpen ? "translateX(20px)" : "translateX(0)"};
    }

    &:nth-child(3) {
      transform: ${({ $isOpen }) => ($isOpen ? "rotate(-45deg)" : "rotate(0)")};
    }
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: url("/assets/blue-marble.png");
  background-size: cover;
  flex-direction: column;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  max-height: calc(100vh - ${NAV_HEIGHT}px);
  overflow-y: auto;

  @media (min-width: 768px) {
    display: inline-flex;
    position: static;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    gap: clamp(8px, 1.2vw, 15px);
    background: none;
    box-shadow: none;
    padding: 0 16px;
    max-height: none;
    overflow: visible;
  }

  @media (min-width: 1024px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-gutter: stable both-edges;

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
  }
`;

const NavItem = styled(Link)`
  color: #f8f8f8;
  text-decoration: none;
  font-size: 16px;
  padding: 12px 16px;
  border-radius: 6px;
  line-height: 1.4;
  transition: 0.3s ease-in-out;
  text-align: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #ffd700;
  }

  @media (min-width: 768px) {
    font-size: clamp(14px, 1.05vw, 16px);
    padding: 8px 10px;
  }
`;
