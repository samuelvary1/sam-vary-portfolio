import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import yaml from "js-yaml";
import "../Recipes/recipes.css";

const RecipePage = () => {
  const { slug } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Set background styling via body class for consistency
  useEffect(() => {
    document.body.classList.add("recipes-body");
    return () => {
      document.body.classList.remove("recipes-body");
    };
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`/data/recipes/${slug}.yml`);
        if (!res.ok) throw new Error(`HTTP ${res.status} on ${slug}.yml`);
        const text = await res.text();
        const parsed = yaml.load(text);
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
        <div className="recipe-header">
          <h1 className="recipe-title">{recipe.title || "Untitled Recipe"}</h1>
          {(recipe.prep_time || recipe.cook_time || recipe.servings) && (
            <div className="recipe-meta">
              {recipe.prep_time && <span>⏱️ Prep: {recipe.prep_time}</span>}
              {recipe.cook_time && <span>🔥 Cook: {recipe.cook_time}</span>}
              {recipe.servings && <span>🍽️ Serves: {recipe.servings}</span>}
            </div>
          )}
        </div>

        {recipe.image && typeof recipe.image === "string" && (
          <img
            src={recipe.image}
            alt={`${recipe.title}`}
            className="recipe-image"
          />
        )}

        <div className="recipe-content">
          {Array.isArray(recipe.ingredients) && (
            <div className="recipe-column">
              <h2>Ingredients</h2>
              <ul className="ingredients-list">
                {recipe.ingredients.map((item, index) => {
                  const isHeader =
                    typeof item === "string" && item.startsWith("For the");

                  return (
                    <li
                      key={index}
                      className={isHeader ? "ingredient-section-header" : ""}
                    >
                      {typeof item === "string"
                        ? item
                        : typeof item === "object" && item !== null
                          ? Object.entries(item)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")
                          : String(item)}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {Array.isArray(recipe.instructions) && (
            <div className="recipe-column">
              <h2>Instructions</h2>
              <ol className="instructions-list">
                {recipe.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipePage;
