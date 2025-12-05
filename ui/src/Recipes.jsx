import React, { useState } from 'react';
import {
    Box,
    Heading,
    SimpleGrid,
    Text,
    Stack,
    Badge,
    IconButton,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    HStack,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

import { API_URL } from './App.jsx';

// Portions of the recipe card layout and Chakra UI styling were developed with assistance from ChatGPT.
// The design direction, customization, and final implementation were completed by Maria Haddon.

export default function Recipes({
    recipes,
    onDelete,
    onSearch,
    searchQuery,
    sortOrder,
    setSearchQuery,
    setSortOrder,
    page,
    setPage,
    limit,
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [recipeToDelete, setRecipeToDelete] = useState(null);
    const [plannerOpen, setPlannerOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');

    const handleOpenModal = (id) => {
        setRecipeToDelete(id);
        onOpen();
    };

    const openPlanner = (recipe) => {
        setSelectedRecipe(recipe);
        setPlannerOpen(true);
    };

    const handleConfirmDelete = () => {
        if (recipeToDelete) {
            onDelete(recipeToDelete);
        }
        onClose();
    };

    const assignMeal = async () => {
        if (!selectedDate) return;

        await fetch(
            `${API_URL}/recipes/${selectedRecipe.id}/plan?planned_for=${selectedDate}`,
            {
                method: 'PATCH',
            }
        );

        setPlannerOpen(false);
        setSelectedDate('');
        onSearch(searchQuery, sortOrder, page);
    };

    return (
        <Box>
            <Heading size="lg" mb={6} color="brand.700">
                Your Recipes
            </Heading>

            <Box mb={6} display="flex" gap={4}>
                <Input
                    placeholder="Search recipes"
                    value={searchQuery}
                    bg="white"
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        setPage(0);
                        onSearch(value, sortOrder, 0);
                    }}
                />

                <Select
                    value={sortOrder}
                    bg="white"
                    w="220px"
                    onChange={(e) => {
                        const value = e.target.value;
                        setSortOrder(value);
                        setPage(0);
                        onSearch(searchQuery, value, 0);
                    }}
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="title-asc">Title A–Z</option>
                    <option value="title-desc">Title Z–A</option>
                    <option value="planned">Planned date</option>
                    <option value="updated">Recently updated</option>
                </Select>
            </Box>

            {recipes.length === 0 ? (
                <Text color="gray.600">No recipes found.</Text>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {recipes.map((recipe) => (
                        <Box
                            key={recipe.id}
                            bg="white"
                            p={6}
                            borderRadius="xl"
                            boxShadow="md"
                            borderWidth="1px"
                            borderColor="brand.100"
                            position="relative"
                        >
                            <IconButton
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                size="sm"
                                position="absolute"
                                top="10px"
                                right="10px"
                                zIndex="10"
                                onClick={() => handleOpenModal(recipe.id)}
                            />

                            <Stack spacing={3} mt={4}>
                                <Heading size="md" color="brand.700">
                                    {recipe.title}
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

                                {recipe.instructions && (
                                    <Box>
                                        <Badge mb={1} colorScheme="orange">
                                            Steps
                                        </Badge>
                                        <Text
                                            fontSize="sm"
                                            whiteSpace="pre-wrap"
                                        >
                                            {recipe.instructions}
                                        </Text>
                                    </Box>
                                )}

                                {recipe.planned_for && (
                                    <Badge mt={2} colorScheme="green">
                                        Planned for: {recipe.planned_for}
                                    </Badge>
                                )}

                                <Button
                                    colorScheme="teal"
                                    size="sm"
                                    onClick={() => openPlanner(recipe)}
                                >
                                    Plan Meal
                                </Button>
                            </Stack>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            <HStack mt={10} spacing={6} justifyContent="center">
                <Button
                    colorScheme="orange"
                    variant="solid"
                    borderRadius="full"
                    px={6}
                    onClick={() => {
                        const newPage = Math.max(0, page - 1);
                        setPage(newPage);
                        onSearch(searchQuery, sortOrder, newPage);
                    }}
                    isDisabled={page === 0}
                >
                    Previous
                </Button>

                <Text fontWeight="semibold" color="gray.700">
                    Page {page + 1}
                </Text>

                <Button
                    colorScheme="orange"
                    variant="solid"
                    borderRadius="full"
                    px={6}
                    onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        onSearch(searchQuery, sortOrder, newPage);
                    }}
                    isDisabled={recipes.length < limit}
                >
                    Next
                </Button>
            </HStack>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Recipe?</ModalHeader>
                    <ModalBody>
                        Are you sure you want to permanently remove this recipe?
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button colorScheme="red" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal
                isOpen={plannerOpen}
                onClose={() => setPlannerOpen(false)}
                isCentered
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Plan Meal</ModalHeader>

                    <ModalBody>
                        <Text mb={3}>Select a date to plan:</Text>

                        <Input
                            type="date"
                            bg="white"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            variant="ghost"
                            mr={3}
                            onClick={() => setPlannerOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button colorScheme="teal" onClick={assignMeal}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}
