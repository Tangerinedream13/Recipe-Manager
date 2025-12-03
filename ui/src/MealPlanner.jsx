import { useEffect, useState } from 'react';
import {
    Box,
    Heading,
    Grid,
    Card,
    CardHeader,
    CardBody,
    Text,
    Button,
    VStack,
    HStack,
    Select,
    Tooltip,
    useToast,
    Flex,
} from '@chakra-ui/react';
import dayjs from 'dayjs';

import { API_URL } from './config'; 

export default function MealPlanner() {
    const [recipes, setRecipes] = useState([]);
    const [weekStart, setWeekStart] = useState(
        dayjs().startOf('week').add(1, 'day')
    );
    const [weekDates, setWeekDates] = useState([]);
    const toast = useToast();

    // Compute 7 days in selected week
    useEffect(() => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(weekStart.add(i, 'day'));
        }
        setWeekDates(days);
    }, [weekStart]);

    // Fetch recipes (sorted by planned date)
    const fetchRecipes = async () => {
        try {
            const res = await fetch(
                `${API_URL}/recipes?sort=planned&limit=200`
            );
            const data = await res.json();

            // Ensure planned_for is always a string
            const safeData = data.map((r) => ({
                ...r,
                planned_for: r.planned_for || '',
            }));

            setRecipes(safeData);
        } catch {
            toast({
                title: 'Error loading recipes',
                status: 'error',
                duration: 2000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    // Assign meal to a date
    const assignDate = async (recipeId, dateStr) => {
        try {
            const res = await fetch(
                `${API_URL}/recipes/${recipeId}/plan?planned_for=${dateStr}`,
                { method: 'PATCH' }
            );

            if (res.ok) {
                toast({
                    title: 'Meal planned!',
                    status: 'success',
                    duration: 1500,
                });
                fetchRecipes();
            }
        } catch {
            toast({
                title: 'Error assigning meal',
                status: 'error',
            });
        }
    };

    // Clear all meals for a date
    const clearMealsForDate = async (dateStr) => {
        const meals = recipes.filter((r) => r.planned_for === dateStr);

        for (const meal of meals) {
            await fetch(`${API_URL}/recipes/${meal.id}/plan?planned_for=`, {
                method: 'PATCH',
            });
        }

        toast({
            title: 'Meals cleared',
            status: 'info',
            duration: 1500,
        });

        fetchRecipes();
    };

    return (
        <Box p={6}>
            <Heading mb={4}>Weekly Meal Planner</Heading>

            {/* Week Navigation */}
            <Flex justify="space-between" mb={4}>
                <Button
                    colorScheme="orange"
                    onClick={() => setWeekStart(weekStart.subtract(7, 'day'))}
                >
                    ← Previous Week
                </Button>

                <Button
                    colorScheme="orange"
                    onClick={() => setWeekStart(weekStart.add(7, 'day'))}
                >
                    Next Week →
                </Button>
            </Flex>

            {/* Calendar Grid */}
            <Grid templateColumns="repeat(7, 1fr)" gap={4}>
                {weekDates.map((d) => {
                    const dateStr = d.format('YYYY-MM-DD');
                    const meals = recipes.filter(
                        (r) => r.planned_for === dateStr
                    );

                    return (
                        <Card key={dateStr} bg="gray.50" borderRadius="xl">
                            <CardHeader>
                                <Heading size="md">{d.format('dddd')}</Heading>
                                <Text color="gray.500" fontSize="sm">
                                    {d.format('MMM D')}
                                </Text>

                                {meals.length > 0 && (
                                    <Button
                                        mt={2}
                                        size="sm"
                                        colorScheme="red"
                                        variant="outline"
                                        onClick={() =>
                                            clearMealsForDate(dateStr)
                                        }
                                    >
                                        Clear Meal
                                    </Button>
                                )}
                            </CardHeader>

                            <CardBody>
                                <VStack align="stretch" spacing={3}>
                                    {meals.length === 0 && (
                                        <Text color="gray.400" fontSize="sm">
                                            No meal planned
                                        </Text>
                                    )}

                                    {meals.map((meal) => (
                                        <Tooltip
                                            key={meal.id}
                                            label={meal.description}
                                            bg="orange.400"
                                            color="white"
                                            borderRadius="md"
                                            p={2}
                                        >
                                            <Box
                                                p={3}
                                                borderRadius="md"
                                                bg="white"
                                                boxShadow="md"
                                            >
                                                <Text fontWeight="bold">
                                                    {meal.title}
                                                </Text>
                                            </Box>
                                        </Tooltip>
                                    ))}

                                    <AssignMealDropdown
                                        recipes={recipes}
                                        dateStr={dateStr}
                                        onAssign={assignDate}
                                    />
                                </VStack>
                            </CardBody>
                        </Card>
                    );
                })}
            </Grid>
        </Box>
    );
}

// Dropdown to assign meals
function AssignMealDropdown({ recipes, dateStr, onAssign }) {
    const [selected, setSelected] = useState('');

    return (
        <HStack>
            <Select
                placeholder="Assign meal..."
                bg="white"
                value={selected}
                onChange={(e) => {
                    setSelected(e.target.value);
                    onAssign(e.target.value, dateStr);
                }}
            >
                {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                        {r.title}
                    </option>
                ))}
            </Select>
        </HStack>
    );
}