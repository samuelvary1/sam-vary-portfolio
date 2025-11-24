import { useState, useEffect } from "react";
import yaml from "js-yaml";

// Manual list of slugs corresponding to each recipe file name
const recipeSlugs = [
  "italian-beef-meatballs",
  "sourdough-pancakes",
  "pickled-red-onions",
  "fish-tacos",
  "pumpkin-cheesecake",
  "oatmeal-cookies",
  "shepherds-pie-carrot-mushroom",
  "lasagna",
  "chicken-over-rice",
  // Add more slugs here
];

export default function useRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const loaded = await Promise.all(
          recipeSlugs.map(async (slug) => {
            try {
              const res = await fetch(`/data/recipes/${slug}.yml`);
              if (!res.ok) throw new Error(`Failed to fetch ${slug}.yml`);
              const text = await res.text();
              const parsed = yaml.load(text);
              return parsed;
            } catch (err) {
              console.error(`Error loading recipe ${slug}:`, err);
              return null; // Return null for failed recipes
            }
          }),
        );

        // Filter out null values (failed recipes)
        const validRecipes = loaded.filter((recipe) => recipe !== null);
        setRecipes(validRecipes);
      } catch (err) {
        console.error("Error loading recipes:", err);
        setRecipes([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  return { recipes, loading };
}
