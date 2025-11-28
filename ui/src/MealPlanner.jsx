import { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  VStack,
  HStack,
  Select,
  Tooltip,
  useToast,
  Divider,
  Flex
} from "@chakra-ui/react";
import dayjs from "dayjs";

export default function MealPlanner() {
  const [recipes, setRecipes] = useState([]);
  const [weekStart, setWeekStart] = useState(dayjs().startOf("week").add(1, "day")); // Monday
  const [weekDates, setWeekDates] = useState([]);
  const toast = useToast();

  // Compute days in selected week
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(weekStart.add(i, "day"));
    }
    setWeekDates(dates);
  }, [weekStart]);

  // Fetch recipes sorted by planned date
  const fetchRecipes = async () => {
    try {
      const res = await fetch(
        "http://localhost:8000/recipes?sort=planned&limit=200"
      );
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      toast({
        title: "Error loading recipes",
        status: "error",
        isClosable: true
      });
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Assign a recipe to a date
  const assignDate = async (recipeId, dateStr) => {
    try {
      const res = await fetch(
        `http://localhost:8000/recipes/${recipeId}/plan?planned_for=${dateStr}`,
        { method: "PATCH" }
      );

      if (res.ok) {
        toast({
          title: "Meal planned!",
          status: "success"
        });
        fetchRecipes();
      }
    } catch {
      toast({
        title: "Error assigning meal",
        status: "error"
      });
    }
  };

  // Clear all meals for a date
  const clearMealsForDate = async (dateStr) => {
    const meals = recipes.filter((r) => r.planned_for === dateStr);

    for (const meal of meals) {
      await fetch(
        `http://localhost:8000/recipes/${meal.id}/plan?planned_for=`,
        { method: "PATCH" }
      );
    }

    toast({
      title: "Meals cleared",
      status: "info"
    });

    fetchRecipes();
  };

  // Italian-themed badge scheme
  const getStatusBadge = (dateStr) => {
    if (!dateStr) return null;

    const today = dayjs().format("YYYY-MM-DD");

    if (dateStr < today) return <Badge colorScheme="red">Past</Badge>;
    if (dateStr === today) return <Badge colorScheme="yellow">Today</Badge>;
    return <Badge colorScheme="green">Upcoming</Badge>; // basil green
  };

  // Weekly summary
  const mealsThisWeek = recipes.filter((r) =>
    weekDates.some((d) => r.planned_for === d.format("YYYY-MM-DD"))
  );
  const unplannedDays = weekDates.length - mealsThisWeek.length;
  const upcomingMeals = mealsThisWeek.filter(
    (m) => m.planned_for >= dayjs().format("YYYY-MM-DD")
  );

  return (
    <Box p={6}>
      <Heading mb={4}>Weekly Meal Planner</Heading>

      {/* Weekly Summary */}
      <Card p={4} mb={6} bg="white" boxShadow="md" borderRadius="lg">
        <Heading size="md" mb={2}>This Week's Summary</Heading>
        <Text>
          🍝 Meals planned: <b>{mealsThisWeek.length}</b> / 7
        </Text>
        <Text>🍅 Days with no meal: <b>{unplannedDays}</b></Text>
        <Text>🌿 Upcoming meals: <b>{upcomingMeals.length}</b></Text>
      </Card>

      {/* Week Navigation */}
      <Flex justify="space-between" mb={4}>
        <Button
          colorScheme="orange"
          onClick={() => setWeekStart(weekStart.subtract(7, "day"))}
        >
          ← Previous Week
        </Button>

        <Button
          colorScheme="orange"
          onClick={() => setWeekStart(weekStart.add(7, "day"))}
        >
          Next Week →
        </Button>
      </Flex>

      <Grid templateColumns="repeat(7, 1fr)" gap={4}>
        {weekDates.map((d) => {
          const dateStr = d.format("YYYY-MM-DD");
          const meals = recipes.filter((r) => r.planned_for === dateStr);

          return (
            <Card key={dateStr} bg="gray.50" borderRadius="xl">
              <CardHeader>
                <Heading size="md">{d.format("dddd")}</Heading>
                <Text color="gray.500" fontSize="sm">
                  {d.format("MMM D")}
                </Text>

                {/* Clear Meal Button */}
                {meals.length > 0 && (
                  <Button
                    mt={2}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={() => clearMealsForDate(dateStr)}
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
                      bg="orange.300"
                      color="white"
                      borderRadius="md"
                      p={2}
                    >
                      <Box p={3} borderRadius="md" bg="white" boxShadow="md">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{meal.title}</Text>
                          {getStatusBadge(meal.planned_for)}
                        </HStack>
                      </Box>
                    </Tooltip>
                  ))}

                  {/* Assign Meal */}
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

// Dropdown component to assign meal to a date
function AssignMealDropdown({ recipes, dateStr, onAssign }) {
  const [selected, setSelected] = useState("");

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