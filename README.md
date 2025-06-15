# EFT Item Tracker

A web application for tracking Escape from Tarkov item collection for tasks and hideout upgrades.

## Features

- **Google Authentication**: Sign in with your Google account
- **Item Collection Tracking**: Track your Found in Raid items with quantities and notes
- **Task Progress**: Monitor your progress on trader tasks and required items
- **Hideout Upgrades**: Plan your hideout upgrades and track required materials
- **Search & Filter**: Find items quickly with search and category filtering
- **Real-time Sync**: All data is synced to Firebase Firestore

## Tech Stack

- **Frontend**: Vue.js 3 + Nuxt.js 3
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-in)
- **Database**: Firebase Firestore
- **Infrastructure**: Firebase Hosting (recommended)

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Google provider
3. Create a Firestore database
4. Get your Firebase configuration from Project Settings

### 2. Environment Variables

1. Copy `.env.example` to `.env`
2. Fill in your Firebase configuration:

```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Firestore Security Rules

Set up the following security rules in your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own item collection
    match /userItems/{document} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Project Structure

```
├── assets/css/          # Global styles and Tailwind CSS
├── components/          # Vue components
├── composables/         # Vue composables for Firebase integration
├── data/               # Static data (items, tasks, hideout)
├── pages/              # Application pages
├── plugins/            # Nuxt plugins (Firebase initialization)
├── types/              # TypeScript type definitions
└── public/             # Static assets
```

## Key Files

- `plugins/firebase.client.ts` - Firebase initialization
- `composables/useAuth.ts` - Authentication composable
- `composables/useFirestore.ts` - Firestore operations
- `data/items.ts` - EFT item database
- `data/tasks.ts` - Task requirements
- `data/hideout.ts` - Hideout upgrade requirements

## Usage

1. **Sign In**: Use Google authentication to sign in
2. **Track Items**: Go to Items page to track your collection with Found in Raid quantities
3. **View Tasks**: Check Tasks page to see your progress on trader tasks
4. **Plan Hideout**: Use Hideout page to plan upgrades and track required materials
5. **Search**: Use search functionality to quickly find specific items

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational purposes. Escape from Tarkov is a trademark of Battlestate Games Limited.
