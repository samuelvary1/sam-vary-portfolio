import React from "react";
import { useNavigate } from "react-router-dom";
import useWriting from "../../hooks/useWriting";
import "./WritingList.css"; // optional styles

const WritingList = () => {
  const { writings, loading } = useWriting();
  const navigate = useNavigate();

  if (loading) return <p>Loading writing...</p>;

  return (
    <div className="writing-list-page">
      <h1 className="writing-heading">Writing</h1>
      <div className="writing-grid">
        {writings.map((piece) => (
          <div
            key={piece.slug}
            className="writing-card"
            onClick={() => navigate(`/writing/${piece.slug}`)}
          >
            <img
              src={piece.thumbnail}
              alt={piece.title}
              className="writing-thumb"
            />
            <h3>{piece.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WritingList;
