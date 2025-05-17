import React from "react";
import { useNavigate } from "react-router-dom";
import useRecipes from "../../hooks/useRecipes";
import "../Recipes/recipes.css"; // optional: style list page

const RecipesList = () => {
  const { recipes, loading } = useRecipes();
  const navigate = useNavigate();

  if (loading) return <p>Loading recipes...</p>;

  return (
    <div className="recipes-list-page">
      <h1 className="parchment-title">Recipes</h1>
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
    </div>
  );
};

export default RecipesList;
