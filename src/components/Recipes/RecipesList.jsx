import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useRecipes from "../../hooks/useRecipes";
import "../Recipes/recipes.css";

const RecipesList = () => {
  const { recipes, loading } = useRecipes();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("recipes-body");
    return () => {
      document.body.classList.remove("recipes-body");
    };
  }, []);

  return (
    <div className="recipes-body-wrapper">
      <div className="recipes-list-page">
        <h1 className="parchment-title">Recipes</h1>

        {loading ? (
          <p className="parchment-title">Loading recipes...</p>
        ) : recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          <ul className="recipes-list">
            {recipes.map((recipe) => (
              <li
                key={recipe.slug}
                className="recipe-link"
                onClick={() => navigate(`/recipes/${recipe.slug}`)}
              >
                {recipe.title}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecipesList;
