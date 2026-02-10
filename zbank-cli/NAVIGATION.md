# Navigation System Documentation

## Overview

The zBANK CLI navigation system implements a state machine pattern similar to the COBOL mainframe application. It provides a structured way to navigate between different screens (Login, Home, Register, Exit).

## Architecture

### State Machine

The navigation uses an enum-based state machine with four states:

```typescript
enum AppState {
  LOGIN = 'LOGIN',      // State 0 in COBOL
  HOME = 'HOME',        // State 1 in COBOL
  REGISTER = 'REGISTER', // State 2 in COBOL
  EXIT = 'EXIT'         // New state for clean exit
}
```

### Components

#### 1. NavigationManager (`src/services/NavigationManager.ts`)

A standalone service class that manages navigation state and history:
- Tracks current state
- Maintains navigation history stack
- Provides state transition methods
- Supports back navigation

#### 2. NavigationContext (`src/contexts/NavigationContext.tsx`)

React Context provider that makes navigation available to all components:
- Uses React hooks for state management
- Provides `useNavigation()` hook
- Wraps the entire application

#### 3. App Container (`src/components/App.tsx`)

Main application component that:
- Reads current state from NavigationContext
- Renders appropriate screen based on state
- Passes navigation callbacks to screens

### Screen Components

All screens are placeholders that will be fully implemented in later tasks:

1. **LoginScreen** - Account/PIN entry (Task 06)
2. **HomeScreen** - Transaction menu (Task 07)
3. **RegisterScreen** - Account registration (Task 08)
4. **ExitScreen** - Logout confirmation (implemented)

### Common UI Components

Reusable components for consistent UI:

1. **Header** - zBANK branding with gradient logo
2. **Footer** - Action hints (keyboard shortcuts)
3. **ErrorMessage** - Standardized error display

## State Transitions

```
     START
       ↓
    LOGIN
       ↓ (success)
     HOME
       ↓ (register)
   REGISTER
       ↓ (back)
    LOGIN
       ↓ (quit)
     EXIT
```

## Usage

### Basic Navigation

```typescript
import { useNavigation } from './contexts/NavigationContext';
import { AppState } from './types/navigation';

function MyScreen() {
  const { currentState, navigateTo, goBack } = useNavigation();
  
  // Navigate to a new screen
  const handleLogin = () => {
    navigateTo(AppState.HOME);
  };
  
  // Go back to previous screen
  const handleBack = () => {
    goBack();
  };
  
  return (
    <Box>
      <Text>Current state: {currentState}</Text>
    </Box>
  );
}
```

### App Setup

```typescript
import { NavigationProvider } from './contexts/NavigationContext';
import { App } from './components/App';

render(
  <NavigationProvider>
    <App />
  </NavigationProvider>
);
```

## Testing

Navigation logic is fully tested with 23 unit tests:
- Constructor and initialization
- State transitions
- History management
- Back navigation
- State machine flows

Run tests:
```bash
npm test -- tests/services/NavigationManager.test.ts
```

## COBOL Comparison

| COBOL | TypeScript |
|-------|-----------|
| `MOVE 0 TO SCREEN-STATE` | `setState(AppState.LOGIN)` |
| `IF SCREEN-STATE = 0` | `currentState === AppState.LOGIN` |
| `EXEC CICS SEND MAP('ZLOGIN')` | `<LoginScreen />` |
| State stored in variable | State managed by React |

## Future Enhancements

- Animation transitions between screens
- Keyboard shortcuts for navigation
- Navigation guards (prevent navigation if unsaved changes)
- Deep linking support
- Navigation history persistence

## Related Files

- `src/types/navigation.ts` - Type definitions
- `src/services/NavigationManager.ts` - Service class
- `src/contexts/NavigationContext.tsx` - React context
- `src/components/App.tsx` - Main container
- `tests/services/NavigationManager.test.ts` - Unit tests
