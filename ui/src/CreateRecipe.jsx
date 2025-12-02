import React, { useState } from 'react';
import {
    Box,
    Heading,
    FormControl,
    FormLabel,
    Input,
    Textarea,
    Button,
    Stack,
    useToast,
} from '@chakra-ui/react';

/* https://chakra-ui.com/docs/components/form-control */

export default function CreateRecipe({ onSave }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');

    const toast = useToast();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!title.trim()) {
            toast({
                title: 'Recipe needs a title',
                status: 'warning',
                duration: 2000,
                isClosable: true,
            });
            return;
        }

        onSave({ title, description, ingredients, instructions });

        setTitle('');
        setDescription('');
        setIngredients('');
        setInstructions('');

        toast({
            title: 'Recipe saved',
            status: 'success',
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <Box
            maxW="700px"
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="md"
            borderWidth="1px"
            borderColor="brand.100"
        >
            <Heading size="lg" mb={6} color="brand.700">
                Add New Recipe
            </Heading>

            <form onSubmit={handleSubmit}>
                <Stack spacing={5}>
                    <FormControl isRequired>
                        <FormLabel>Title</FormLabel>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Chicken Alfredo"
                            bg="brand.50"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="A creamy Italian classic..."
                            rows={3}
                            bg="brand.50"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Ingredients</FormLabel>
                        <Textarea
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            placeholder="2 cups pasta, 1 cup cream..."
                            rows={4}
                            bg="brand.50"
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Instructions</FormLabel>
                        <Textarea
                            value={instructions}
                            onChange={(e) =>
                                setInstructions(e.target.value)
                            }
                            placeholder={'1. Boil pasta\n2. Make sauce...'}
                            rows={4}
                            bg="brand.50"
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        colorScheme="orange"
                        alignSelf="flex-start"
                    >
                        Save Recipe
                    </Button>
                </Stack>
            </form>
        </Box>
    );
}