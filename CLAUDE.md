# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run test:run` - Run tests once (non-watch mode)

## Architecture Overview

This is a Nuxt 3 Vue.js application for tracking Escape from Tarkov items with Firebase backend:

### Core Structure
- **Pages**: `pages/` directory contains main application routes (items, tasks, hideout, settings tracking)
- **Components**: Reusable Vue components in `components/` with specialized cards for different data types
- **Composables**: Business logic and integrations in `composables/`
  - `useAuth.ts` - Google authentication with Firebase Auth and guest mode support
  - `useFirestore.ts` - Database operations for user collections with guest storage fallback
  - `useGuestStorage.ts` - Local storage implementation for guest users
  - Domain-specific composables: `useTaskProgress.ts`, `useHideoutProgress.ts`, `useItemRequirements.ts`
- **Data Layer**: Static EFT game data in `data/` (items.ts, tasks.ts, hideout.ts, traders.ts)
- **Types**: Comprehensive TypeScript definitions in `types/index.ts`
- **Utils**: Shared business logic in `utils/taskPageLogic.ts`

### Firebase Integration
- Authentication: Google Sign-in with optional guest mode via `useAuth`
- Database: Firestore with collections:
  - `users/{userId}` - User profiles with player level
  - `userItems/{userId}_{itemId}` - Item collection tracking with quantities and FIR status
  - `userHideoutProgress/{userId}` - Hideout station completion tracking
  - `userTaskObjectives/{userId}` - Task objective completion tracking
  - `userCompletedTasks/{userId}` - Task completion status
  - `userSettings/{userId}` - User preferences and settings
- Plugin: `plugins/firebase.client.ts` initializes Firebase services
- Guest Mode: Local storage fallback via `useGuestStorage` for unauthenticated users

### Key Data Flow
1. User authenticates via Google or continues as guest (`useAuth` composable)
2. Data persistence switches between Firestore and localStorage based on auth state
3. Real-time sync with Firestore for authenticated users via snapshot listeners
4. Static EFT game data combines with user progress data in pages
5. Composables provide reactive state management and business logic

### Testing Setup
- Framework: Vitest with happy-dom environment
- Test files located in `tests/` directory with organized subdirectories:
  - `composables/` - Unit tests for composables
  - `integration/` - Integration tests for complex workflows
  - `utils/` - Tests for utility functions
- Setup file: `tests/setup.ts` configures test environment
- Aliases configured in `vitest.config.ts` for import resolution

### I18n Configuration
- Nuxt i18n module with English and Japanese locales
- Strategy: `no_prefix` with automatic browser language detection
- Locale files in `i18n/locales/` (en.json, ja.json)
- Cookie-based language persistence

### Environment Setup
Requires `.env` file with Firebase configuration variables (see README.md for details).

### Styling
Uses Tailwind CSS v4 with custom styles in `assets/css/main.css` and flag-icons CDN for country flags.