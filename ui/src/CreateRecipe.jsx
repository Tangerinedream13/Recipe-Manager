import React, { useState } from "react";

export default function CreateRecipe({ API_URL, onRecipeCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Still posting to /todos until backend is rebuilt
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          completed: false, // still needed for now
        }),
      });

      if (!response.ok) {
        console.error("Failed to create recipe");
        return;
      }

      if (onRecipeCreated) {
        onRecipeCreated();
      }

      // Clear form fields
      setTitle("");
      setDescription("");

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

      <button type="submit">Add Recipe</button>

      <div className="side-note">
        Recipe list updates automatically after adding a new recipe!
      </div>
    </form>
  );
}