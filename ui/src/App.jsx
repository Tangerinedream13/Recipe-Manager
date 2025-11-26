import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import Layout from './Layout';
import Recipes from './Recipes';
import CreateRecipe from './CreateRecipe';

export default function App() {
    const [activeView, setActiveView] = useState('recipes');

    const [recipes, setRecipes] = useState([
        {
            id: 1,
            name: 'Chicken Alfredo',
            description:
                'A creamy Italian classic with fettuccine and parmesan.',
            ingredients:
                '2 cups pasta\n1 cup cream\n1/2 cup parmesan\n2 tbsp butter',
            steps: '1. Boil pasta\n2. Make sauce\n3. Toss together and serve warm.',
        },
    ]);

    const handleAddRecipe = (recipe) => {
        setRecipes((prev) => [{ id: Date.now(), ...recipe }, ...prev]);
        setActiveView('recipes');
    };

    return (
        <Box minH="100vh" bg="brand.50">
            <Layout activeView={activeView} onChangeView={setActiveView}>
                {activeView === 'recipes' ? (
                    <Recipes recipes={recipes} />
                ) : (
                    <CreateRecipe onSave={handleAddRecipe} />
                )}
            </Layout>
        </Box>
    );
}
