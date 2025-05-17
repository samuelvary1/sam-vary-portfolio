import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../Writing/WritingPage.css";

const WritingPage = () => {
  const { slug } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWriting = async () => {
      try {
        const metaRes = await fetch("/data/writing/metadata.json");
        const meta = await metaRes.json();
        const match = meta.find((entry) => entry.slug === slug);
        setTitle(match?.title || "Untitled");

        const textRes = await fetch(`/data/writing/${slug}.txt`);
        const text = await textRes.text();
        setContent(text);
      } catch (err) {
        console.error("Error loading writing:", err);
        setContent("Could not load writing.");
      } finally {
        setLoading(false);
      }
    };

    loadWriting();
  }, [slug]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="writing-page">
      <div className="writing-scroll-box">
        <h1 className="writing-title">{title}</h1>
        <pre className="writing-content">{content}</pre>
      </div>
    </div>
  );
};

export default WritingPage;
