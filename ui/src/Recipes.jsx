import React from 'react';
import { Box, Heading, SimpleGrid, Text, Stack, Badge } from '@chakra-ui/react';

export default function Recipes({ recipes }) {
    return (
        <Box>
            <Heading size="lg" mb={6} color="brand.700">
                Your Recipes
            </Heading>

            {recipes.length === 0 ? (
                <Text color="gray.600">
                    No recipes yet. Click “Add New Recipe” in the sidebar to
                    create one.
                </Text>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {recipes.map((recipe) => (
                        <Box
                            key={recipe.id}
                            bg="white"
                            p={6}
                            borderRadius="xl"
                            boxShadow="sm"
                            borderWidth="1px"
                            borderColor="brand.100"
                        >
                            <Stack spacing={3}>
                                <Heading size="md" color="brand.700">
                                    {recipe.name}
                                </Heading>

                                {recipe.description && (
                                    <Text fontSize="sm" color="gray.700">
                                        {recipe.description}
                                    </Text>
                                )}

                                {recipe.ingredients && (
                                    <Box>
                                        <Badge mb={1} colorScheme="orange">
                                            Ingredients
                                        </Badge>
                                        <Text
                                            fontSize="sm"
                                            whiteSpace="pre-wrap"
                                        >
                                            {recipe.ingredients}
                                        </Text>
                                    </Box>
                                )}

                                {recipe.steps && (
                                    <Box>
                                        <Badge mb={1} colorScheme="orange">
                                            Steps
                                        </Badge>
                                        <Text
                                            fontSize="sm"
                                            whiteSpace="pre-wrap"
                                        >
                                            {recipe.steps}
                                        </Text>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Box>
    );
}
