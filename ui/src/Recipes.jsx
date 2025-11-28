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
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

export default function Recipes({ recipes, onDelete }) {
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
                            boxShadow="md"
                            borderWidth="1px"
                            borderColor="brand.100"
                            position="relative"
                        >
                            {/* DELETE BUTTON */}
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
