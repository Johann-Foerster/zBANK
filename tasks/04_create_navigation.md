# Task 04: Create CLI Menu Navigation

## Objective
Build a state machine-based navigation system for the CLI application, replicating the COBOL screen state management pattern.

## Background
The COBOL application uses a state machine with three states:
- State 0: Login Screen
- State 1: Home/Transaction Screen
- State 2: Registration Screen

We'll implement similar navigation using React Ink components and state management.

## Requirements

### Navigation States
```typescript
enum AppState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  EXIT = 'EXIT'
}

interface NavigationContext {
  currentState: AppState;
  previousState: AppState | null;
  navigateTo: (state: AppState) => void;
  goBack: () => void;
}
```

### Screen Components
1. **LoginScreen**: Account/PIN entry (State 0)
2. **HomeScreen**: Transaction menu (State 1)
3. **RegisterScreen**: New account registration (State 2)
4. **ExitScreen**: Logout confirmation

## Deliverables

1. **Navigation Manager**
   ```typescript
   // src/services/NavigationManager.ts
   class NavigationManager {
     private state: AppState;
     private history: AppState[];
     
     getCurrentState(): AppState;
     navigateTo(state: AppState): void;
     goBack(): void;
     canGoBack(): boolean;
     getHistory(): AppState[];
   }
   ```

2. **App Container Component**
   ```typescript
   // src/components/App.tsx
   import React from 'react';
   import { Box } from 'ink';
   
   export const App: React.FC = () => {
     const [state, setState] = React.useState<AppState>(AppState.LOGIN);
     
     const renderScreen = () => {
       switch (state) {
         case AppState.LOGIN:
           return <LoginScreen onSuccess={() => setState(AppState.HOME)} />;
         case AppState.HOME:
           return <HomeScreen onLogout={() => setState(AppState.LOGIN)} />;
         case AppState.REGISTER:
           return <RegisterScreen onBack={() => setState(AppState.LOGIN)} />;
         case AppState.EXIT:
           return <ExitScreen />;
       }
     };
     
     return <Box flexDirection="column">{renderScreen()}</Box>;
   };
   ```

3. **Navigation Context Provider**
   ```typescript
   // src/contexts/NavigationContext.tsx
   import React from 'react';
   
   export const NavigationContext = React.createContext<NavigationContext | null>(null);
   
   export const NavigationProvider: React.FC<Props> = ({ children }) => {
     const [currentState, setCurrentState] = useState(AppState.LOGIN);
     const [history, setHistory] = useState<AppState[]>([]);
     
     const navigateTo = (state: AppState) => {
       setHistory([...history, currentState]);
       setCurrentState(state);
     };
     
     const goBack = () => {
       if (history.length > 0) {
         const previous = history[history.length - 1];
         setHistory(history.slice(0, -1));
         setCurrentState(previous);
       }
     };
     
     return (
       <NavigationContext.Provider value={{ currentState, navigateTo, goBack }}>
         {children}
       </NavigationContext.Provider>
     );
   };
   ```

4. **Common UI Components**
   - Header component with branding
   - Footer with action hints
   - Error message display
   - Loading spinner
   - Confirmation dialogs

## Acceptance Criteria

- [x] Navigation state machine implemented
- [x] All screen transitions work correctly
- [x] Back navigation functions properly
- [x] App container renders correct screen based on state
- [x] Navigation context available to all components
- [x] Screen history tracking works
- [x] Exit flow properly terminates application
- [x] Unit tests for navigation logic

## Implementation Steps

1. Create `src/types/navigation.ts` with types and enums

2. Implement `src/services/NavigationManager.ts`

3. Create `src/contexts/NavigationContext.tsx`

4. Build `src/components/App.tsx` as main container

5. Create placeholder screen components:
   - `src/components/screens/LoginScreen.tsx`
   - `src/components/screens/HomeScreen.tsx`
   - `src/components/screens/RegisterScreen.tsx`
   - `src/components/screens/ExitScreen.tsx`

6. Create common components:
   - `src/components/common/Header.tsx`
   - `src/components/common/Footer.tsx`
   - `src/components/common/ErrorMessage.tsx`

7. Wire navigation into `src/index.tsx`

8. Write unit tests for navigation flows

## Testing

### Navigation Flow Tests
```typescript
describe('NavigationManager', () => {
  it('should start in LOGIN state', () => {
    const nav = new NavigationManager();
    expect(nav.getCurrentState()).toBe(AppState.LOGIN);
  });
  
  it('should navigate to HOME after successful login', () => {
    const nav = new NavigationManager();
    nav.navigateTo(AppState.HOME);
    expect(nav.getCurrentState()).toBe(AppState.HOME);
  });
  
  it('should maintain navigation history', () => {
    const nav = new NavigationManager();
    nav.navigateTo(AppState.HOME);
    nav.navigateTo(AppState.REGISTER);
    
    const history = nav.getHistory();
    expect(history).toEqual([AppState.LOGIN, AppState.HOME]);
  });
  
  it('should navigate back to previous state', () => {
    const nav = new NavigationManager();
    nav.navigateTo(AppState.HOME);
    nav.navigateTo(AppState.REGISTER);
    nav.goBack();
    
    expect(nav.getCurrentState()).toBe(AppState.HOME);
  });
});
```

### Integration Tests with Ink
```typescript
import { render } from 'ink-testing-library';
import { App } from './App';

describe('App Navigation', () => {
  it('should render login screen initially', () => {
    const { lastFrame } = render(<App />);
    expect(lastFrame()).toContain('ZBANK LOGIN');
  });
  
  // More integration tests...
});
```

## UI Design

### Screen Layout Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                        zBANK CLI                             │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                    [Screen Content Here]                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [Q] Quit  [R] Register  [↵] Continue                       │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme
```typescript
const colors = {
  primary: '#00D9FF',      // Cyan for headers
  success: '#00FF00',      // Green for success messages
  error: '#FF0000',        // Red for errors
  warning: '#FFFF00',      // Yellow for warnings
  info: '#FFFFFF',         // White for general text
  secondary: '#888888',    // Gray for hints
};
```

## State Transition Diagram

```
     ┌─────────────┐
     │   START     │
     └──────┬──────┘
            │
            ▼
     ┌─────────────┐
     │   LOGIN     │◄──────────┐
     └──────┬──────┘           │
            │                  │
     [Login Success]    [Logout or Back]
            │                  │
            ▼                  │
     ┌─────────────┐           │
     │    HOME     │───────────┘
     └──────┬──────┘
            │
     [Action: Register]
            │
            ▼
     ┌─────────────┐
     │  REGISTER   │
     └──────┬──────┘
            │
       [Action: Q]
            │
            └──────────────────┘
```

## Mapping COBOL to React

### COBOL State Machine
```cobol
MOVE 0 TO SCREEN-STATE.  * Start at login

PERFORM UNTIL EXIT-CONDITION = 1
  IF SCREEN-STATE = 0 THEN
    EXEC CICS SEND MAP('ZLOGIN') END-EXEC
  END-IF
  
  IF SCREEN-STATE = 1 THEN
    EXEC CICS SEND MAP('ZHOME') END-EXEC
  END-IF
  
  IF SCREEN-STATE = 2 THEN
    EXEC CICS SEND MAP('ZRGSTR') END-EXEC
  END-IF
END-PERFORM
```

### React State Machine
```typescript
const [state, setState] = useState(AppState.LOGIN);

const renderScreen = () => {
  switch (state) {
    case AppState.LOGIN:
      return <LoginScreen onSuccess={() => setState(AppState.HOME)} />;
    case AppState.HOME:
      return <HomeScreen onLogout={() => setState(AppState.LOGIN)} />;
    case AppState.REGISTER:
      return <RegisterScreen onBack={() => setState(AppState.LOGIN)} />;
    default:
      return null;
  }
};
```

## Related Tasks
- Task 01: Initialize React CLI Application
- Task 06: Build Login Screen Component
- Task 07: Build Home/Transaction Screen
- Task 08: Build Registration Screen

## References
- COBOL state machine: `docs/overview.md` (lines 99-123, 303-350)
- [React Ink Documentation](https://github.com/vadimdemedes/ink)
- [React Context API](https://react.dev/reference/react/useContext)
