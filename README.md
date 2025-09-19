# NHH Squash Ladder

A professional squash ladder management system for Nordea Hamburg, built with React and Firebase.

## System Overview

The NHH Squash Ladder is a web-based application that manages a competitive squash ladder system, allowing players to challenge each other, record match results, and track ladder positions. The system includes user authentication, real-time notifications, and comprehensive match statistics.

## Solution Architecture

### Frontend (React Application)
- **Framework**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React icon library
- **Deployment**: Vercel for static hosting and CI/CD

### Backend Services
- **Authentication**: Firebase Authentication (email/password)
- **Database**: Firestore (NoSQL document database)
- **File Storage**: Static assets served via Vercel
- **Email Notifications**: Firebase Functions + Email service integration

### External Integrations
- **Firebase Project**: Handles authentication, database, and cloud functions
- **Vercel Platform**: Handles deployment, domain management, and build pipeline
- **Email Service**: Automated challenge and match notifications

## Project Structure

```
nhh-squash-ladder/
├── public/
│   ├── Adding_Text_and_Trophy_to_Video.mp4    # Opening animation video
│   └── index.html                              # App entry point
├── src/
│   ├── components/                             # React components
│   │   ├── app-modular.js                     # Main application component
│   │   ├── auth.js                            # Authentication component
│   │   ├── LoginWithGuide.js                  # User onboarding interface
│   │   ├── OpeningAnimation.js                # Video intro component
│   │   ├── ladder.js                          # Ladder view and management
│   │   ├── challenges.js                      # Challenge management
│   │   ├── challengeManager.js                # Challenge business logic
│   │   ├── notifications.js                   # Notification UI components
│   │   └── shared.js                          # Reusable UI components
│   ├── hooks/
│   │   └── useFirebaseAuth.js                 # Firebase authentication hook
│   ├── services/                              # Business logic and API calls
│   │   ├── firebaseService.js                 # Firebase database operations
│   │   ├── emailService.js                    # Email notification system
│   │   └── userLookupService.js               # User management utilities
│   ├── firebase.js                            # Firebase configuration
│   └── index.js                               # React app entry point
├── archive/                                   # Archived/backup files
├── firebase.json                              # Firebase configuration
├── firestore.rules                            # Firestore security rules
├── .env.local                                 # Environment variables (local)
└── README.md                                  # This documentation
```

## Key Components

### 1. Main Application (`app-modular.js`)
- **Purpose**: Root component managing application state and routing
- **Key Features**:
  - User authentication state management
  - Navigation between views (Ladder, Challenges, Matches, Statistics, Rules)
  - Data loading and persistence
  - Challenge expiration monitoring
- **Dependencies**: All major services and view components

### 2. Authentication System
- **Components**: `auth.js`, `useFirebaseAuth.js`
- **Features**: 
  - Firebase email/password authentication
  - User session management
  - Login/logout functionality
  - User profile integration

### 3. User Onboarding (`LoginWithGuide.js`)
- **Purpose**: Comprehensive user guide and authentication interface
- **Features**:
  - Feature explanations
  - How-to guides
  - Integrated authentication
  - Professional branding

### 4. Video Introduction (`OpeningAnimation.js`)
- **Purpose**: Professional video intro for first-time users
- **Features**:
  - Auto-play video with controls
  - Conditional display logic
  - Smooth transition to main app

### 5. Core Functionality Components

#### Ladder Management (`ladder.js`)
- Player ranking display
- Position management
- Challenge initiation
- Player statistics

#### Challenge System (`challenges.js`, `challengeManager.js`)
- Challenge creation and management
- Response handling (accept/decline)
- Match scheduling
- Automatic expiration

#### Match Recording
- Score entry and validation
- Position updates after matches
- Match history tracking
- Walkover support

#### Statistics and Reporting
- Player performance metrics
- Match history analysis
- Ladder statistics
- Win/loss tracking

## Data Architecture

### Firestore Collections

```
users/
├── {userId}
│   ├── displayName: string
│   ├── email: string
│   ├── role: "player"
│   ├── createdAt: timestamp
│   └── isVerified: boolean

players/
├── {playerId}
│   ├── name: string
│   ├── email: string
│   ├── position: number
│   ├── wins: number
│   ├── losses: number
│   └── isActive: boolean

challenges/
├── {challengeId}
│   ├── challengerId: string
│   ├── challengedId: string
│   ├── status: "pending" | "accepted" | "declined" | "expired"
│   ├── createdAt: timestamp
│   ├── expiryDate: timestamp
│   └── message?: string

matches/
├── {matchId}
│   ├── challengeId: string
│   ├── winnerId: string
│   ├── loserId: string
│   ├── matchScore: string
│   ├── gameScores: string
│   ├── isWalkover: boolean
│   ├── date: string
│   ├── winnerPositionBefore: number
│   └── loserPositionBefore: number

notifications/
├── {notificationId}
│   ├── userId: string
│   ├── type: string
│   ├── message: string
│   ├── isRead: boolean
│   └── createdAt: timestamp
```

## Firebase Integration

### Authentication Flow
1. User enters credentials in `auth.js` component
2. `useFirebaseAuth.js` hook handles Firebase Auth API calls
3. Authentication state propagated through app via `onAuthStateChange`
4. User data stored/retrieved from Firestore `users` collection

### Database Operations
- **Create**: New players, challenges, matches via `firebaseService.js`
- **Read**: Real-time data loading with Firestore listeners
- **Update**: Position changes, challenge responses, match results
- **Delete**: Challenge cleanup, expired data removal

### Security Rules
- Users can only read/write their own data
- Match results require both player authentication
- Admin operations restricted to verified users

## Vercel Deployment

### Build Process
1. **Source**: GitHub repository automatically triggers builds
2. **Build Command**: `npm run build` - creates optimized production bundle
3. **Output**: Static files served from `build/` directory
4. **Environment**: Production environment variables injected during build

### Environment Variables
```
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=xxx
REACT_APP_FIREBASE_APP_ID=xxx
```

### Deployment URL
- **Production**: `nhh-squash-ladder.vercel.app`
- **Auto-deployment**: Triggered on `main` branch commits
- **Preview**: Generated for pull requests

## Feature Set

### Core Features
- **User Authentication**: Secure login/logout with Firebase Auth
- **Ladder Management**: Real-time player rankings and position tracking
- **Challenge System**: Players can challenge others within ranking rules
- **Match Recording**: Comprehensive score tracking with game details
- **Statistics**: Player performance analytics and match history
- **Notifications**: Email alerts for challenges and match updates

### Business Rules
- Players can challenge others up to 3 positions above them
- One active challenge per player at a time
- Challenges expire after 3 weeks if not responded to
- Winners take losers' positions (if higher)
- Best of 5 games format (first to 3 games wins)
- Walkover victories supported

### User Experience Features
- **Professional Video Intro**: Company-branded opening animation
- **User Onboarding**: Comprehensive guide for new users
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live data synchronization across users
- **Intuitive Navigation**: Clean, professional interface

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm start           # Start development server (port 3000)
npm run build       # Create production build
npm test            # Run test suite (if configured)
```

### File Modification Impact
- **`app-modular.js`**: Core app functionality - test thoroughly
- **Firebase services**: Database operations - verify data integrity
- **Authentication**: Login/logout flow - test user sessions
- **Components**: UI changes - check responsive design

### Debugging
- **Firebase Console**: Monitor authentication and database operations
- **Vercel Dashboard**: Check deployment status and logs
- **Browser DevTools**: Debug React components and network requests
- **Console Logs**: Track application state and errors

## Maintenance Guidelines

### Regular Tasks
- **Monitor Firebase quotas**: Check authentication and database usage
- **Review Firestore rules**: Ensure security remains appropriate
- **Update dependencies**: Keep React and Firebase libraries current
- **Test core flows**: Verify challenge/match workflows periodically

### Troubleshooting Common Issues
- **Authentication failures**: Check Firebase config and API keys
- **Data not loading**: Verify Firestore permissions and network connectivity
- **Build failures**: Check for syntax errors and dependency conflicts
- **Email notifications not sending**: Verify Firebase Functions deployment

### Scaling Considerations
- **User growth**: Monitor Firestore read/write limits
- **Performance**: Consider pagination for large datasets
- **Features**: New functionality should follow existing patterns
- **Security**: Regular review of Firestore rules and user permissions

## Support Information

### Technology Stack Versions
- React: 18.x
- Firebase: 9.x
- Node.js: 18.x (for build process)
- Tailwind CSS: 3.x

### Key Configuration Files
- `firebase.js`: Firebase SDK configuration
- `firestore.rules`: Database security rules
- `vercel.json`: Deployment configuration (if present)
- `package.json`: Dependencies and build scripts

This documentation provides the foundation for maintaining and extending the NHH Squash Ladder system. For specific technical questions, refer to the inline code comments and official documentation for React, Firebase, and Vercel.