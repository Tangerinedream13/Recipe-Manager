import React, { useState, useEffect } from 'react';
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

    const handleOpenModal = (id) => {
        setRecipeToDelete(id);
        onOpen();
    };

    const handleConfirmDelete = () => {
        if (recipeToDelete) {
            onDelete(recipeToDelete);
        }
        onClose();
    };

    // Re-run backend search whenever page changes
    useEffect(() => {
        onSearch(searchQuery, sortOrder, page);
    }, [page]);

    return (
        <Box>
            <Heading size="lg" mb={6} color="brand.700">
                Your Recipes
            </Heading>

            {/* Search + Sort Controls */}
            <Box mb={6} display="flex" gap={4}>
                <Input
                    placeholder="Search recipes"
                    value={searchQuery}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchQuery(value);
                        onSearch(value, sortOrder, 0);
                        setPage(0);
                    }}
                    bg="white"
                />

                <Select
                    value={sortOrder}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSortOrder(value);
                        onSearch(searchQuery, value, 0);
                        setPage(0);
                    }}
                    bg="white"
                    w="180px"
                >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                </Select>
            </Box>

            {/* Recipe Grid */}
            {recipes.length === 0 ? (
                <Text color="gray.600">
                    No recipes found. Try adjusting your search.
                </Text>
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
                                zIndex="10"
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                size="sm"
                                position="absolute"
                                top="10px"
                                right="10px"
                                onClick={() => handleOpenModal(recipe.id)}
                                aria-label="Delete recipe"
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
                            </Stack>
                        </Box>
                    ))}
                </SimpleGrid>
            )}

            {/* Pagination */}
            <HStack mt={10} spacing={6} justifyContent="center">
                <Button
                    colorScheme="orange"
                    variant="solid"
                    size="md"
                    borderRadius="full"
                    px={6}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    isDisabled={page === 0}
                >
                    Previous
                </Button>

                <Text fontWeight="medium" color="gray.700">
                    Page {page + 1}
                </Text>

                <Button
                    colorScheme="orange"
                    variant="solid"
                    size="md"
                    borderRadius="full"
                    px={6}
                    onClick={() => setPage((p) => p + 1)}
                    isDisabled={recipes.length < limit}
                >
                    Next
                </Button>
            </HStack>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Delete Recipe?</ModalHeader>
                    <ModalBody>
                        Are you sure you want to permanently remove this recipe?
                        This action cannot be undone.
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
        </Box>
    );
}
