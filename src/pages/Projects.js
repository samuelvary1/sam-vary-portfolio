import React from "react";
import styled from "styled-components";

const Projects = () => {
  return (
    <PageContainer>
      <h1>My Projects</h1>
      <p>Here are some of the cool things I've worked on.</p>
    </PageContainer>
  );
};

export default Projects;

// Styled Components
const PageContainer = styled.div`
  padding: 100px 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;