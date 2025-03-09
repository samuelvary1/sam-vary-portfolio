import React from "react";
import styled from "styled-components";

const HomePage = () => {
  return (
    <HomeContainer>
      <HeroSection>
        <h1>Welcome to My Portfolio</h1>
        <p>I'm Samuel Vary, a developer and creator.</p>
        <Button href="/projects">View My Work</Button>
      </HeroSection>
    </HomeContainer>
  );
};

export default HomePage;

// Styled Components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background: #f0f0f0;
`;

const HeroSection = styled.div`
  max-width: 600px;
`;

const Button = styled.a`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  font-size: 18px;
  color: white;
  background: #007bff;
  border-radius: 5px;
  text-decoration: none;
  transition: 0.3s;

  &:hover {
    background: #0056b3;
  }
`;
