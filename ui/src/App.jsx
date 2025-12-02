// docker compose up

import React, { useState, useEffect } from 'react';
import { Box, useToast } from '@chakra-ui/react';
import Layout from './Layout';
import Recipes from './Recipes';
import CreateRecipe from './CreateRecipe';
import MealPlanner from "./MealPlanner";

// Use environment variable for API URL, default to localhost for development
// In production (Railway), this will be empty string since frontend and backend are same origin
// Check if VITE_API_URL is explicitly set (even if empty string), otherwise use localhost
const API_URL =
    import.meta.env.VITE_API_URL !== undefined
        ? import.meta.env.VITE_API_URL // address for production architecture
        : 'http://localhost:8000'; // address for local architecture

export default function App() {
    const [activeView, setActiveView] = useState('recipes');
    const toast = useToast();

    const [recipes, setRecipes] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination
    const [page, setPage] = useState(0);
    const limit = 10;

    // Fetch recipes from backend
    const fetchRecipes = async (search = '', sort = 'newest', pageNum = 0) => {
        try {
            const url = `${API_URL}/recipes?q=${encodeURIComponent(
                search
            )}&sort=${sort}&page=${pageNum}&limit=${limit}`;

            const res = await fetch(url);
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

    // Load recipes
    useEffect(() => {
        fetchRecipes(searchQuery, sortOrder, page);
    }, [page]);

    // Add a recipe
    const handleAddRecipe = async (recipe) => {
        try {
            const res = await fetch(`${API_URL}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipe),
            });

            if (!res.ok) throw new Error('Failed to save recipe');

            const savedRecipe = await res.json();
            setRecipes((prev) => [savedRecipe, ...prev]);

            toast({
                title: 'Recipe added',
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

    // Delete a recipe
    const handleDeleteRecipe = async (id) => {
        try {
            const res = await fetch(`${API_URL}/recipes/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete recipe');

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

    return (
        <Box minH="100vh" bg="brand.50">
            <Layout activeView={activeView} onChangeView={setActiveView}>
                {activeView === 'recipes' ? (
                    <Recipes
                        recipes={recipes}
                        onDelete={handleDeleteRecipe}
                        onSearch={fetchRecipes}
                        searchQuery={searchQuery}
                        sortOrder={sortOrder}
                        setSearchQuery={setSearchQuery}
                        setSortOrder={setSortOrder}
                        page={page}
                        setPage={setPage}
                        limit={limit}
                    />
                ) : activeView === 'planner' ? (         
                    <MealPlanner recipes={recipes} />    
                ) : (
                    <CreateRecipe onSave={handleAddRecipe} />
                )}
            </Layout>
        </Box>
    );
}
