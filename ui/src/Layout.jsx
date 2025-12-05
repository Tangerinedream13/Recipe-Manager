import React from 'react';
import {
    Flex,
    Box,
    Heading,
    Text,
    Button,
    VStack,
    Divider,
} from '@chakra-ui/react';

export default function Layout({ activeView, onChangeView, children }) {
    return (
        <Flex minH="100vh">
            {/* Sidebar */}
            <Box
                as="aside"
                w={{ base: '220px', md: '260px' }}
                bg="brand.700"
                color="white"
                p={6}
                display="flex"
                flexDirection="column"
            >
                <Heading size="md" mb={1}>
                    Maria's Italian Recipe Book
                </Heading>
                <Text fontSize="sm" mb={6} color="brand.100">
                    Traditional flavors, modern organization.
                </Text>

                <Divider borderColor="brand.500" mb={4} />

                <VStack align="stretch" spacing={3}>
                    <Button
                        variant={activeView === 'recipes' ? 'solid' : 'ghost'}
                        colorScheme="orange"
                        justifyContent="flex-start"
                        onClick={() => onChangeView('recipes')}
                    >
                        View Recipes
                    </Button>

                    <Button
                        variant={activeView === 'create' ? 'solid' : 'ghost'}
                        colorScheme="orange"
                        justifyContent="flex-start"
                        onClick={() => onChangeView('create')}
                    >
                        Add New Recipe
                    </Button>
                </VStack>

                <Box mt="auto" fontSize="xs" pt={8} color="brand.100">
                    <Text>CSCI Project · Fall 2025</Text>
                </Box>
            </Box>

            {/* Main content */}
            <Box
                as="main"
                flex="1"
                p={{ base: 6, md: 10 }}
                bgGradient="linear(to-b, brand.50, #fff)"
            >
                {children}
            </Box>
        </Flex>
    );
}
