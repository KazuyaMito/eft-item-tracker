# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## Architecture Overview

This is a Nuxt 3 Vue.js application for tracking Escape from Tarkov items with Firebase backend:

### Core Structure
- **Pages**: `pages/` directory contains main application routes (items, tasks, hideout tracking)
- **Components**: Reusable Vue components in `components/` (Header, TabNavigation)
- **Composables**: Firebase integration logic in `composables/`
  - `useAuth.ts` - Google authentication with Firebase Auth
  - `useFirestore.ts` - Database operations for user item collections
- **Data Layer**: Static game data in `data/` (items.ts, tasks.ts, hideout.ts)
- **Types**: TypeScript definitions in `types/index.ts`

### Firebase Integration
- Authentication: Google Sign-in only via Firebase Auth
- Database: Firestore with collections:
  - `users/{userId}` - User profiles
  - `userItems/{userId}_{itemId}` - User item collection tracking
- Plugin: `plugins/firebase.client.ts` initializes Firebase services
- Config: Environment variables for Firebase config (see README.md for setup)

### Key Data Flow
1. User authenticates via Google (useAuth composable)
2. User item collections sync in real-time with Firestore (useFirestore composable)
3. Static EFT game data (items, tasks, hideout) defined in data/ files
4. Pages combine user data with static game data for tracking progress

### Environment Setup
Requires `.env` file with Firebase configuration variables (see README.md for details).

### Styling
Uses Tailwind CSS with custom styles in `assets/css/main.css`.