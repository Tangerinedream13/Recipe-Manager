import React, { useState, useEffect } from "react";

export default function Recipes({ API_URL, refreshTrigger }) {
  const [recipeList, setRecipeList] = useState([]);

  // Fetch recipes (still using /todos until backend is replaced)
  async function fetchRecipes() {
    try {
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error("Failed to fetch recipes");
      const data = await res.json();
      setRecipeList(data);
    } catch (err) {
      console.error(err);
    }
  }

  // Delete a recipe
  async function deleteRecipe(recipeId) {
    try {
      await fetch(`${API_URL}/todos/${recipeId}`, {
        method: "DELETE",
      });
      fetchRecipes();
    } catch (err) {
      console.error(err);
    }
  }

  // Load recipes on mount + whenever parent triggers refresh
  useEffect(() => {
    fetchRecipes();
  }, [refreshTrigger]);

  return (
    <div className="recipes-container">
      <ul>
        {recipeList.map((recipe) => (
          <li key={recipe.id}>
            <div>
              <span>
                {recipe.completed ? "Completed" : "In Progress"}
              </span>{" "}
              <strong>{recipe.title}</strong>
              <br />
              {recipe.description}
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