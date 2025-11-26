import React, { useState } from 'react';
import './globals.css';

import Recipes from './Recipes';
import CreateRecipe from './CreateRecipe';

const API_URL = 'http://localhost:8000';

export default function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    function refreshRecipes() {
        setRefreshTrigger((prev) => prev + 1);
    }

    return (
        <>
            <header>
                <h1>Recipe Manager</h1>
            </header>

            <main>
                <Recipes 
                    API_URL={API_URL} 
                    refreshTrigger={refreshRecipes} 
                />

                <CreateRecipe 
                    API_URL={API_URL} 
                    onRecipeCreated={refreshRecipes} 
                />
            </main>
        </>
    );
}