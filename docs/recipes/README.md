Absolutely — here’s the **ready-to-drop markdown** for your `README.md`, formatted for GitHub or VS Code readability, exactly as it should appear when you paste it into your repo:

---

````markdown
# 🥘 Adding a New Recipe

This guide explains how to add new recipes to the **sam-vary-portfolio** website.

---

## 1️⃣ Create the YAML File

Each recipe is defined as a `.yml` file using the standard format:

```yaml
slug: pumpkin-cheesecake
title: Light & Fluffy Pumpkin Cheesecake Pie
image: /assets/recipes/pumpkin-cheesecake.png
prep_time: 20 minutes
cook_time: 65 minutes
servings: 8
ingredients:
  - 1 ½ cups graham cracker crumbs
  - ¼ cup light brown sugar
  - 6 tbsp unsalted butter, melted
instructions:
  - Preheat oven to 300°F.
  - Combine crust ingredients and bake for 10 minutes.
  - Prepare filling and bake until set.
```
````

**Notes**

- Each file must include `slug`, `title`, `image`, `prep_time`, `cook_time`, `servings`, `ingredients`, and `instructions`.
- Keep formatting consistent (YAML uses spaces, not tabs).

---

## 2️⃣ Save the YAML File

Place your new file in:

```
public/data/recipes/
```

Example:

```
public/data/recipes/pumpkin-cheesecake.yml
```

The filename should match the recipe’s slug.

---

## 3️⃣ Add the Recipe Image

Place your recipe image in:

```
public/assets/recipes/
```

Use a descriptive name that matches the `image` path in your YAML file.

Example:

```
image: /assets/recipes/pumpkin-cheesecake.png
```

✅ Tip: Use PNGs around 800–1200px wide for best quality.

---

## 4️⃣ Register the Recipe Slug

Edit:

```
src/hooks/useRecipes.js
```

Add the new recipe’s slug to the `recipeSlugs` array so it loads automatically:

```js
const recipeSlugs = [
  "fish-tacos",
  "pumpkin-cheesecake",
  // add new recipes here
];
```

---

## 5️⃣ Test Locally

Run your local development server:

```bash
npm run dev
```

Then visit your site and confirm:

- The recipe displays properly
- The image path works
- Formatting looks consistent

---

## ✅ Done!

Your new recipe is now part of the portfolio site.
Enjoy expanding your collection!

```

---

✅ **Where to place this file:**

Put it in
```

public/data/recipes/README.md

```

That way, it lives right beside your YAML recipe files and keeps the workflow dead simple when adding new ones.

Would you like me to make a **shorter “creator cheat sheet”** version (like 10 lines, no explanations) for you to keep at the top of the folder too?
```
