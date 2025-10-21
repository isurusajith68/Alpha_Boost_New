# English Fun Learning App 🌟

A child-friendly English learning app built with React Native and Expo, featuring Firebase authentication and cartoon avatars!

## Features

- 🎨 **Child-Friendly Design**: Vibrant colors, playful animations, and cartoon avatars
- 🔐 **Firebase Authentication**: Secure login and registration system
- 👤 **Profile Management**: Customizable profiles with cartoon avatars
- 📚 **Learning Activities**: Interactive English learning content
- 🎮 **Games**: Fun educational games for children
- 📊 **Progress Tracking**: Monitor learning progress and achievements

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "english-fun-learning")
4. Enable Google Analytics if desired
5. Choose your Google Analytics account
6. Click "Create project"

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" sign-in method
5. Click "Save"

### 3. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database
5. Click "Done"

### 4. Get Firebase Configuration

1. In your Firebase project, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>)
4. Enter an app nickname
5. Copy the Firebase configuration object

### 5. Update Firebase Config

1. Open `config/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
};
```

## Installation & Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Firebase** (see Firebase Setup section above)

3. **Start the development server**
   ```bash
   npm start
   ```

## App Structure

```
app/
├── _layout.tsx          # Root layout with authentication
├── index.tsx            # Home screen (authenticated users)
├── login.tsx            # Login screen
├── register.tsx         # Registration screen
├── profile.tsx          # User profile screen
├── home.tsx             # Learning activities
├── game.tsx             # Games
├── feedback.tsx         # Progress feedback
└── modal.tsx            # Modal screens

components/
├── ChildFriendlyButton.tsx    # Reusable button component
├── FunActivityCard.tsx        # Activity card component
└── AlternativeHome.tsx        # Alternative home layout

contexts/
└── AuthContext.tsx            # Authentication context

config/
└── firebase.ts                # Firebase configuration

constants/
├── theme.ts                   # App theme and colors
└── cartoonImages.ts           # Cartoon avatar options

utils/
└── animations.ts              # Child-friendly animations
```

## Features Overview

### Authentication

- **Login Screen**: Email/password authentication
- **Registration Screen**: Complete user registration with:
  - First name & last name
  - Email address
  - Phone number
  - Password confirmation
  - Cartoon avatar selection
- **Profile Management**: View and manage user profile

### Child-Friendly Design

- Vibrant color palette suitable for children
- Large, touch-friendly buttons
- Cartoon avatars and emojis
- Playful animations and transitions
- Rounded corners and soft shadows

### Learning Features

- Interactive learning activities
- Educational games
- Progress tracking
- Achievement system

## Development

### Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser
- `npm run reset-project` - Reset to a fresh project state

### Code Style

This project uses ESLint for code linting. Run `npm run lint` to check for issues.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
