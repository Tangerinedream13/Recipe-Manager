import React, { useState, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import Layout from './Layout';
import Recipes from './Recipes';
import CreateRecipe from './CreateRecipe';

const API_URL = 'http://localhost:8000';

export default function App() {
    const [activeView, setActiveView] = useState('recipes');
    const toast = useToast();

    // Placeholder recipe
    const [recipes, setRecipes] = useState([
        {
            id: 'placeholder-1',
            title: 'Chicken Alfredo',
            description:
                'A creamy Italian classic with fettuccine and parmesan.',
            ingredients:
                '2 cups pasta\n1 cup cream\n1/2 cup parmesan\n2 tbsp butter',
            instructions:
                '1. Boil pasta\n2. Make sauce\n3. Toss together and serve warm.',
        },
    ]);

    // Load recipes from backend
    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const res = await fetch(`${API_URL}/recipes`);
                const data = await res.json();
                
                    setRecipes(data);
            
            } catch (err) {
                toast({
                    title: 'Failed to load recipes',
                    status: 'error',
                    duration: 2000,
                    isClosable: true,
                });
            }
        };

        fetchRecipes();
    }, []);

    // Add a recipe to the backend
    const handleAddRecipe = async (recipe) => {
        try {
            const res = await fetch(`${API_URL}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: recipe.title,
                    description: recipe.description,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                }),
            });

            if (!res.ok) throw new Error('Failed to save recipe');

            const savedRecipe = await res.json();

            setRecipes((prev) => [savedRecipe, ...prev]);

            toast({
                title: 'Recipe added!',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });

            setActiveView('recipes');
        } catch (err) {
            toast({
                title: 'Error saving recipe',
                status: 'error',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    const handleDeleteRecipe = async (id) => {
        try {
            const res = await fetch(`${API_URL}/recipes/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete recipe');

            // Remove recipe from state
            setRecipes((prev) => prev.filter((r) => r.id !== id));

            toast({
                title: 'Recipe deleted',
                status: 'info',
                duration: 2000,
                isClosable: true,
            });
        } catch (err) {
            toast({
                title: 'Error deleting recipe',
                status: 'error',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    console.log('Recipes state:', recipes);
    return (
        <Box minH="100vh" bg="brand.50">
            <Layout activeView={activeView} onChangeView={setActiveView}>
                {activeView === 'recipes' ? (
                    <Recipes recipes={recipes} onDelete={handleDeleteRecipe} />
                ) : (
                    <CreateRecipe onSave={handleAddRecipe} />
                )}
            </Layout>
        </Box>
    );
}
