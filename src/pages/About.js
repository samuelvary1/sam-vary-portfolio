import React from "react";
import styled from "styled-components";

const About = () => {
  return (
    <PageContainer>
      <h1>About Me</h1>
      <p>
        This is the about page where I'll share my background, skills, and
        experience.
      </p>
    </PageContainer>
  );
};

export default About;

// Styled Components
const PageContainer = styled.div`
  padding: 100px 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;
