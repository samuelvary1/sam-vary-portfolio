import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import yaml from "js-yaml";
import "../Recipes/recipes.css";

const RecipePage = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/data/recipes/${slug}.yml`);
        if (!res.ok) throw new Error(`HTTP ${res.status} on ${slug}.yml`);
        const text = await res.text();
        const parsed = yaml.load(text);
        console.log("Parsed recipe:", parsed); // ✅ debug
        setRecipe(parsed);
      } catch (err) {
        console.error("Failed to load recipe", err);
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [slug]);

  if (loading) return <p>Loading recipe...</p>;
  if (!recipe) return <p>Recipe not found.</p>;

  return (
    <div className="recipe-page">
      <div className="parchment-box">
        <h1 className="recipe-title">{recipe.title || "Untitled Recipe"}</h1>

        {recipe.image && typeof recipe.image === "string" && (
          <img
            src={recipe.image}
            alt={`Handwritten notes for ${recipe.title}`}
            className="recipe-image"
          />
        )}

        {Array.isArray(recipe.ingredients) && (
          <>
            <h2>Ingredients</h2>
            <ul className="ingredients-list">
              {recipe.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {Array.isArray(recipe.instructions) && (
          <>
            <h2>Instructions</h2>
            <ol className="instructions-list">
              {recipe.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipePage;
