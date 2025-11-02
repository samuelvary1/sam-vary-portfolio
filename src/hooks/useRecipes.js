import { useState, useEffect } from "react";
import yaml from "js-yaml";

// Manual list of slugs corresponding to each recipe file name
const recipeSlugs = [
  "italian-beef-meatballs",
  "sourdough-pancakes",
  "pickled-red-onions",
  "fish-tacos",
  "pumpkin-cheesecake",
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
            const res = await fetch(`/data/recipes/${slug}.yml`);
            if (!res.ok) throw new Error(`Failed to fetch ${slug}.yml`);
            const text = await res.text();
            const parsed = yaml.load(text);
            return parsed;
          }),
        );

        setRecipes(loaded);
      } catch (err) {
        console.error("Error loading recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  return { recipes, loading };
}
