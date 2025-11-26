import React, { useState, useEffect } from "react";

export default function Recipes({ API_URL, refreshTrigger }) {
  const [recipeList, setRecipeList] = useState([]);

  // Fetch recipes from recipes
  async function fetchRecipes() {
    try {
      const res = await fetch(`${API_URL}/recipes`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      setRecipeList(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    }
  }

  // Delete a recipe
  async function deleteRecipe(recipeId) {
    try {
      await fetch(`${API_URL}/recipes/${recipeId}`, {
        method: "DELETE",
      });
      fetchRecipes();
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  }

  useEffect(() => {
    fetchRecipes();
  }, [refreshTrigger]);

  return (
    <div className="recipes-container">
      <ul>
        {recipeList.map((recipe) => (
          <li key={recipe.id}>
            <div>
              <strong>{recipe.title}</strong>
              <br />
              {recipe.description && (
                <>
                  <em>{recipe.description}</em>
                  <br />
                </>
              )}

              {recipe.ingredients && (
                <>
                  <strong>Ingredients:</strong>
                  <div>{recipe.ingredients}</div>
                </>
              )}

              {recipe.instructions && (
                <>
                  <strong>Instructions:</strong>
                  <div>{recipe.instructions}</div>
                </>
              )}
            </div>

            <button onClick={() => deleteRecipe(recipe.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}