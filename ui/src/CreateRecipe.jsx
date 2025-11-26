import React, { useState } from "react";

export default function CreateRecipe({ API_URL, onRecipeCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          ingredients,
          instructions,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create recipe");
        return;
      }

      if (onRecipeCreated) {
        onRecipeCreated();
      }

      // Clear form
      setTitle("");
      setDescription("");
      setIngredients("");
      setInstructions("");

    } catch (err) {
      console.error("Error creating recipe:", err);
    }
  }

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Recipe Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Short Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <textarea
        placeholder="Ingredients (one list or paragraph)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <textarea
        placeholder="Instructions"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />

      <button type="submit">Add Recipe</button>

      <div className="side-note">
        Recipe list updates automatically after adding a new recipe!
      </div>
    </form>
  );
}