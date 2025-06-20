# Test Coverage Summary

This directory contains comprehensive tests for the EFT Item Tracker application.

## Test Structure

### Unit Tests

#### `/utils/taskPageLogic.test.ts`
Tests for the core task page logic functions:
- **Task Filtering**: Tests filtering by trader, status (available/locked/completed), player level, and Kappa requirements
- **Task Completion**: Tests for determining if tasks can be completed and checking prerequisites
- **Item Requirements**: Tests progress calculations for item requirements, including Found in Raid distinctions
- **Trader Sorting**: Tests the predefined trader order sorting logic

#### `/composables/`
Tests for Vue composables:
- `useTaskFilters.test.ts` - Task filtering composable tests
- `useItemQuantity.test.ts` - Item quantity management tests
- `useTaskProgress.test.ts` - Task progress tracking tests
- `useItemRequirements.test.ts` - Item requirement calculation tests
- `useDebounce.test.ts` - Debounce utility tests

### Integration Tests

#### `/integration/tasksPageIntegration.test.ts`
Tests the integration of task page logic with real game data:
- Handling real task data structures
- Parallel task filtering
- Kappa requirement filtering with actual tasks
- Trader filtering with real trader names

## Key Logic Tested

### Task Filtering
- Filter by trader selection
- Filter by task status (available, locked, completed, failed)
- Filter by player level
- Filter by Kappa requirements
- Hide tasks with incomplete prerequisites
- Handle parallel/alternative tasks

### Task Completion
- Determine if a task can be completed
- Check task availability based on prerequisites
- Prevent completing failed tasks
- Handle parallel task relationships

### Item Progress
- Calculate correct progress percentages
- Distinguish between Found in Raid and regular items
- Apply appropriate styling based on progress
- Cap percentage at 100%

### Trader Management
- Sort traders in predefined order
- Handle case-insensitive trader names

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/utils/taskPageLogic.test.ts

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

All critical business logic in the tasks page has been extracted into testable functions and thoroughly tested using TDD methodology. The tests ensure:

1. **Correctness**: All filtering and calculation logic works as expected
2. **Edge Cases**: Handles missing data, empty arrays, and boundary conditions
3. **Integration**: Works correctly with real game data
4. **Maintainability**: Logic is extracted into pure functions that are easy to test and modify