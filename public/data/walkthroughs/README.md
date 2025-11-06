# 🎮 Adding a New Game Walkthrough

This guide explains how to add new game walkthroughs to the **sam-vary-portfolio** website.

## 1️⃣ Create the Game Directory

Create a new folder for your game in:

```
public/data/walkthroughs/
```

Use a descriptive slug name (lowercase, hyphens for spaces):

```
public/data/walkthroughs/loom/
public/data/walkthroughs/kings-quest-1/
public/data/walkthroughs/monkey-island-1/
```

## 2️⃣ Create the Walkthrough File

Inside your game directory, create a `walkthrough.md` file:

```
public/data/walkthroughs/your-game/walkthrough.md
```

Use this standard format:

```markdown
# GAME TITLE - FAQ/Walkthrough

## Guide Information

**Author:** Your Name  
**E-mail:** your(at)email(dot)com  
**System:** PC/Console  
**Updated:** November 6, 2025  
**Version:** 1.0

## Table of Contents

1. [Introduction](#1-introduction)
2. [Walkthrough](#2-walkthrough)
   - [Chapter 1](#chapter-1)
   - [Chapter 2](#chapter-2)
3. [Tips and Tricks](#3-tips-and-tricks)
4. [Copyright Information](#4-copyright-information)

## Version History

- **1.0:** November 6, 2025 (First version)

---

## 1. Introduction

Brief description of the game and walkthrough...

---

## 2. Walkthrough

### Chapter 1

Detailed walkthrough content...

### Chapter 2

More walkthrough content...

---

## 3. Tips and Tricks

Additional helpful information...

---

## 4. Copyright Information

Copyright notice and usage permissions...
```

**Notes:**

- Use proper Markdown headers (`#`, `##`, `###`)
- Create anchor links in the table of contents (`[text](#anchor)`)
- Use consistent formatting throughout

## 3️⃣ Add Game Thumbnail (Optional)

Place a thumbnail image in:

```
public/assets/walkthroughs/
```

If no custom image is available, the system will use the placeholder image automatically.

## 4️⃣ Register the Walkthrough

Edit: `public/data/walkthroughs/index.json`

Add your new walkthrough to the `walkthroughs` array:

```json
{
  "id": "your-game-slug",
  "title": "Full Game Title",
  "subtitle": "Descriptive Subtitle",
  "genre": "Adventure/RPG/Action/etc",
  "developer": "Game Developer",
  "year": 1990,
  "difficulty": "Beginner/Intermediate/Advanced",
  "thumbnail": "/assets/walkthroughs/placeholder.png",
  "description": "Brief description of the game and walkthrough contents.",
  "chapters": ["Chapter 1", "Chapter 2", "Chapter 3"],
  "estimatedTime": "4-6 hours",
  "lastUpdated": "2024-11-06",
  "features": [
    "Complete puzzle solutions",
    "All item locations",
    "Death prevention tips",
    "Perfect scoring guide"
  ]
}
```

**Important:**

- The `id` must match your directory name
- Add the entry in alphabetical order by title
- Update the `totalWalkthroughs` count in the metadata section
- Update the `lastUpdated` date in metadata

## 5️⃣ Update Metadata

In the same `index.json` file, update the metadata section:

```json
"metadata": {
  "totalWalkthroughs": 16,  // increment this number
  "lastUpdated": "2024-11-06",  // update date
  "genres": [...],  // add new genre if needed
  "difficultyLevels": ["Beginner", "Intermediate", "Advanced"]
}
```

## 6️⃣ Test Locally

Run your local development server:

```bash
npm run dev
```

Then visit your site and confirm:

- The walkthrough appears in the main walkthroughs list
- The walkthrough file displays properly with working table of contents
- All links and formatting work correctly
- Thumbnail displays (or placeholder shows)

## ✅ Done!

Your new walkthrough should now be fully integrated into the website!

## 📝 Tips

- **Keep chapters organized:** Use clear, descriptive chapter names
- **Bold important items:** Highlight key items, spells, or actions in **bold**
- **Use consistent formatting:** Follow the established patterns from existing walkthroughs
- **Test thoroughly:** Make sure all internal links work and formatting is clean
- **Add helpful features:** Include things like item lists, maps, or quick reference sections
