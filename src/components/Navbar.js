import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Navbar = () => {
  return (
    <Nav>
      <NavContainer>
        <Logo>Sam Vary</Logo>
        <NavLinks>
          <NavItem to="/">Home</NavItem>
          <NavItem to="/about">About</NavItem>
          <NavItem to="/projects">Projects</NavItem>
          <NavItem to="/contact">Contact</NavItem>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
};

export default Navbar;

// Styled Components
const Nav = styled.nav`
  width: 100%;
  padding: 15px 20px;
  background: #333;
  position: fixed;
  top: 0;
  left: 0;
  color: white;
`;

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: 24px;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 15px;
`;

const NavItem = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: 0.3s;

  &:hover {
    color: #007bff;
  }
`;