import React from "react";
import styled from "styled-components";

const Contact = () => {
  return (
    <PageContainer>
      <h1>Contact Me</h1>
      <p>Reach out to me at <a href="mailto:youremail@example.com">sam.vary@gmail.com</a></p>
    </PageContainer>
  );
};

export default Contact;

// Styled Components
const PageContainer = styled.div`
  padding: 100px 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;