import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./WalkthroughPage.css";

const WalkthroughPage = () => {
  const { id } = useParams();
  const [walkthrough, setWalkthrough] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);

  const fetchWalkthroughContent = useCallback(async () => {
    try {
      setLoading(true);

      // First, get the walkthrough metadata
      const metaResponse = await fetch("/data/walkthroughs/index.json");
      const metaData = await metaResponse.json();
      const walkthroughMeta = metaData.walkthroughs.find((w) => w.id === id);

      if (!walkthroughMeta) {
        setError("Walkthrough not found");
        setLoading(false);
        return;
      }

      setWalkthrough(walkthroughMeta);

      // Then, get the markdown content
      const contentResponse = await fetch(
        `/data/walkthroughs/${id}/walkthrough.md`,
      );
      const markdownContent = await contentResponse.text();

      setContent(markdownContent);
      setLoading(false);
    } catch (error) {
      console.error("Error loading walkthrough:", error);

      // Fallback content for demo
      setWalkthrough({
        id: id,
        title: "Sample Walkthrough",
        subtitle: "Demo Content",
        genre: "Adventure",
        year: 1990,
        chapters: ["Introduction", "Chapter 1", "Chapter 2", "Conclusion"],
        estimatedTime: "6-8 hours",
      });

      setContent(`# Sample Walkthrough: ${id}

## Introduction

This is a sample walkthrough demonstrating the markdown format. In a real walkthrough, you would include:

### Game Overview
- **Title**: Game Name
- **Developer**: Studio Name
- **Release Year**: 1990
- **Platform**: PC/DOS

### What You'll Need
- The original game files
- A compatible emulator (like ScummVM)
- Patience for puzzle-solving!

## Chapter 1: Getting Started

### Opening Scene
When the game begins, you'll find yourself on a dock. This is where your adventure starts!

![Opening Scene](/assets/walkthroughs/${id}/screenshot-001.jpg "The opening dock scene")

### First Steps
1. **Talk to the important-looking pirate** - This will give you your first clue
2. **Examine the barrel** - You might find something useful inside
3. **Pick up the rope** - Always useful in adventure games!

> **💡 Tip**: Always examine everything you can interact with. Adventure games reward thorough exploration.

### The Three Trials
To become a pirate, you must complete three trials:

#### Trial 1: Sword Fighting
- Find the sword master in the SCUMM Bar
- Learn the insults and comebacks
- Practice with other pirates

#### Trial 2: Treasure Hunting
- Get the treasure map from the Governor's mansion
- Decipher the clues
- Navigate to the treasure location

#### Trial 3: Thievery
- Sneak into the store after hours
- Avoid the shopkeeper
- Steal the precious idol

## Chapter 2: Advanced Strategies

### Inventory Management
Keep track of your items:
- **Map pieces** - Combine these when you find all four
- **Rubber chicken** - More useful than it looks!
- **Breath mints** - Essential for certain conversations

### Dialogue Choices
Choose your responses carefully:
- Funny responses often yield the best results
- Some characters respond better to specific approaches
- Save before important conversations

## Troubleshooting

### Common Issues
- **Stuck on a puzzle?** Try combining different inventory items
- **Can't progress?** Make sure you've talked to everyone
- **Missing items?** Revisit earlier locations

### Easter Eggs
Look out for these hidden features:
- References to other LucasArts games
- Developer signatures in the credits
- Secret dialogue options

## Conclusion

Congratulations on completing this adventure! The journey of a pirate is never easy, but with persistence and wit, you've proven yourself worthy of the Caribbean seas.

Remember: The real treasure was the friends we made along the way... and also the actual treasure you found!

---

*This walkthrough was created with love for classic adventure gaming. Happy adventuring! 🏴‍☠️*`);

      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWalkthroughContent();
  }, [fetchWalkthroughContent]);

  // Add scroll listener to update active chapter based on visible section
  useEffect(() => {
    if (!walkthrough?.chapters) return;

    const handleScroll = () => {
      const headings = document.querySelectorAll("h2[data-chapter]");
      let currentActive = 0;

      headings.forEach((heading, index) => {
        const rect = heading.getBoundingClientRect();
        // If heading is in the upper portion of the viewport
        if (rect.top <= 200) {
          // Find matching chapter index
          const chapterText = heading.getAttribute("data-chapter");
          const chapterIndex = walkthrough.chapters.findIndex(
            (chapter) =>
              chapter.toLowerCase().includes(chapterText.toLowerCase()) ||
              chapterText.toLowerCase().includes(chapter.toLowerCase()),
          );
          if (chapterIndex !== -1) {
            currentActive = chapterIndex;
          }
        }
      });

      setActiveChapter(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [walkthrough]);

  const scrollToChapter = (chapterIndex) => {
    setActiveChapter(chapterIndex);

    // Get the chapter name and convert it to the expected ID format
    const chapterName = walkthrough.chapters[chapterIndex];

    // Convert chapter name to match markdown anchor format
    // Remove special characters and convert to lowercase with hyphens
    const elementId = chapterName
      .toLowerCase()
      .replace(/['']/g, "") // Remove apostrophes
      .replace(/[^a-z0-9\s]/g, "") // Remove other special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .trim();

    const element = document.getElementById(elementId);
    if (element) {
      // Calculate the scroll position accounting for fixed headers
      const navbarHeight = 80; // Approximate navbar height
      const walkthroughNavHeight = 100; // Approximate walkthrough nav height
      const totalOffset = navbarHeight + walkthroughNavHeight;

      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      // Fallback: try to find by heading text content
      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      for (let heading of headings) {
        const headingText = heading.textContent.toLowerCase().trim();
        const chapterText = chapterName.toLowerCase().trim();

        // Check if heading contains the chapter name or vice versa
        if (
          headingText.includes(chapterText) ||
          chapterText.includes(headingText)
        ) {
          // Use the same manual offset calculation for fallback
          const navbarHeight = 80;
          const walkthroughNavHeight = 100;
          const totalOffset = navbarHeight + walkthroughNavHeight;

          const elementPosition =
            heading.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - totalOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
          break;
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="walkthrough-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading walkthrough...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="walkthrough-page">
        <div className="error-state">
          <h2>Walkthrough Not Found</h2>
          <p>{error}</p>
          <Link to="/walkthroughs" className="back-link">
            ← Back to Walkthroughs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="walkthrough-page">
      <div className="walkthrough-nav">
        <Link to="/walkthroughs" className="nav-back-button">
          ← All Walkthroughs
        </Link>
      </div>

      <div className="walkthrough-container">
        <aside className="walkthrough-sidebar">
          <div className="walkthrough-info">
            <h2>{walkthrough.title}</h2>
            <p className="subtitle">{walkthrough.subtitle}</p>

            <div className="game-details">
              <div className="detail-item">
                <span className="label">Genre:</span>
                <span className="value">{walkthrough.genre}</span>
              </div>
              <div className="detail-item">
                <span className="label">Year:</span>
                <span className="value">{walkthrough.year}</span>
              </div>
              <div className="detail-item">
                <span className="label">Est. Time:</span>
                <span className="value">{walkthrough.estimatedTime}</span>
              </div>
            </div>
          </div>

          <nav className="chapter-nav">
            <h3>Table of Contents</h3>
            <ul>
              {walkthrough.chapters.map((chapter, index) => (
                <li key={index}>
                  <button
                    className={`chapter-link ${activeChapter === index ? "active" : ""}`}
                    onClick={() => scrollToChapter(index)}
                  >
                    {chapter}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="walkthrough-actions">
            <button className="print-button" onClick={() => window.print()}>
              🖨️ Print Guide
            </button>
          </div>
        </aside>

        <main className="walkthrough-content">
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                // Custom components for better styling
                h1: ({ children }) => {
                  const id = children
                    .toString()
                    .toLowerCase()
                    .replace(/['']/g, "") // Remove apostrophes
                    .replace(/[^a-z0-9\s]/g, "") // Remove other special characters
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .trim();
                  return <h1 id={id}>{children}</h1>;
                },
                h2: ({ children }) => {
                  const id = children
                    .toString()
                    .toLowerCase()
                    .replace(/['']/g, "") // Remove apostrophes
                    .replace(/[^a-z0-9\s]/g, "") // Remove other special characters
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .trim();
                  return (
                    <h2 id={id} data-chapter={children.toString()}>
                      {children}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  const id = children
                    .toString()
                    .toLowerCase()
                    .replace(/['']/g, "") // Remove apostrophes
                    .replace(/[^a-z0-9\s]/g, "") // Remove other special characters
                    .replace(/\s+/g, "-") // Replace spaces with hyphens
                    .trim();
                  return <h3 id={id}>{children}</h3>;
                },
                img: ({ src, alt, title }) => (
                  <div className="image-container">
                    <div className="image-placeholder">
                      <div className="placeholder-icon">🖼️</div>
                      <div className="placeholder-text">
                        {alt || "Game Screenshot"}
                      </div>
                      {title && (
                        <div className="placeholder-caption">{title}</div>
                      )}
                    </div>
                  </div>
                ),
                blockquote: ({ children }) => (
                  <div className="tip-box">{children}</div>
                ),
                code: ({ children }) => (
                  <code className="inline-code">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="code-block">{children}</pre>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WalkthroughPage;
