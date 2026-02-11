# zBANK CLI - Development Guide

This guide is for developers who want to understand, modify, or contribute to the zBANK CLI project.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Strategy](#testing-strategy)
- [Adding New Features](#adding-new-features)
- [Debugging Tips](#debugging-tips)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: 8.0.0 or higher
- **Git**: For version control
- **Terminal**: Modern terminal with ANSI color support

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/Johann-Foerster/zBANK.git
cd zBANK/zbank-cli

# Install dependencies
npm install --legacy-peer-deps

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build production bundle with tsup |
| `npm run dev` | Development mode with hot reload |
| `npm start` | Run the built CLI application |
| `npm test` | Run all tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run typecheck` | Check TypeScript types |
| `npm run lint` | Lint code with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run seed` | Seed database with test accounts |

## Project Structure

```
zbank-cli/
├── src/                          # Source code
│   ├── components/               # React Ink UI components
│   │   ├── App.tsx              # Main app container with navigation
│   │   ├── common/              # Reusable UI components
│   │   │   ├── BalanceDisplay.tsx    # Balance formatting component
│   │   │   ├── CurrencyInput.tsx     # Currency input with validation
│   │   │   ├── ErrorMessage.tsx      # Error display component
│   │   │   ├── Footer.tsx            # Screen footer
│   │   │   ├── Header.tsx            # Screen header
│   │   │   └── NumericInput.tsx      # Numeric input (account/PIN)
│   │   └── screens/             # Full-screen components
│   │       ├── LoginScreen.tsx       # Login/authentication
│   │       ├── HomeScreen.tsx        # Main banking interface
│   │       ├── RegisterScreen.tsx    # New account registration
│   │       └── ExitScreen.tsx        # Goodbye screen
│   ├── contexts/                # React contexts for state management
│   │   ├── NavigationContext.tsx    # Navigation state
│   │   └── ServiceContext.tsx       # Service instances (DI)
│   ├── hooks/                   # Custom React hooks
│   │   └── useKeyboard.ts           # Keyboard shortcut handler
│   ├── models/                  # Data models and schemas
│   │   ├── Account.ts               # Account data model
│   │   └── Transaction.ts           # Transaction data model
│   ├── services/                # Business logic layer
│   │   ├── IStorage.ts              # Storage interface
│   │   ├── JsonStorage.ts           # JSON file storage implementation
│   │   ├── AuthService.ts           # Authentication service
│   │   ├── TransactionService.ts    # Transaction processing
│   │   ├── NavigationManager.ts     # Navigation state machine
│   │   ├── SessionManager.ts        # User session management
│   │   └── index.ts                 # Service exports
│   ├── scripts/                 # Utility scripts
│   │   └── seed.ts                  # Database seeding script
│   ├── types/                   # TypeScript type definitions
│   │   └── navigation.ts            # Navigation types
│   ├── utils/                   # Utility functions
│   │   ├── crypto.ts                # PIN hashing utilities
│   │   ├── formatter.ts             # Display formatting
│   │   ├── validation.ts            # Input validation
│   │   └── migration.ts             # COBOL compatibility utilities
│   └── index.tsx                # Application entry point
├── tests/                       # Test files (mirrors src structure)
│   ├── unit/                    # Unit tests (NOT USED - tests mirror src)
│   ├── integration/             # Integration tests
│   ├── e2e/                     # End-to-end tests
│   ├── components/              # Component tests
│   ├── models/                  # Model tests
│   ├── services/                # Service tests
│   ├── hooks/                   # Hook tests
│   └── utils/                   # Utility tests
├── data/                        # Application data (created at runtime)
│   ├── accounts.json            # Account database
│   └── transactions.json        # Transaction history
├── dist/                        # Build output (generated)
├── coverage/                    # Test coverage reports (generated)
├── docs/                        # Additional documentation
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── jest.config.js               # Jest test configuration
├── eslint.config.js             # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── .gitignore                   # Git ignore rules
├── README.md                    # Project overview
├── USAGE.md                     # User guide
├── DEVELOPMENT.md               # This file
├── ARCHITECTURE.md              # Technical architecture
└── MIGRATION.md                 # COBOL to React mapping
```

## Architecture Overview

### Layered Architecture

The application follows a clean layered architecture:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (React Ink Components/Screens)       │
├─────────────────────────────────────────┤
│          Application Layer              │
│     (Contexts, Hooks, Navigation)       │
├─────────────────────────────────────────┤
│          Business Logic Layer           │
│  (Services: Auth, Transaction, etc.)    │
├─────────────────────────────────────────┤
│           Data Access Layer             │
│        (Storage Interface/Impl)         │
├─────────────────────────────────────────┤
│          Persistence Layer              │
│         (JSON Files on Disk)            │
└─────────────────────────────────────────┘
```

### Key Design Patterns

1. **Dependency Injection**: Services injected via React Context
2. **Repository Pattern**: IStorage interface with JsonStorage implementation
3. **State Machine**: NavigationManager for screen transitions
4. **Service Layer**: Business logic separated from UI
5. **Schema Validation**: Zod schemas for runtime type checking

### Component Hierarchy

```
App
├── NavigationContext.Provider
│   └── ServiceContext.Provider
│       ├── LoginScreen
│       │   ├── Header
│       │   ├── NumericInput (Account)
│       │   ├── NumericInput (PIN)
│       │   ├── ErrorMessage
│       │   └── Footer
│       ├── HomeScreen
│       │   ├── Header
│       │   ├── BalanceDisplay
│       │   ├── SelectInput (Menu)
│       │   ├── CurrencyInput (Transaction)
│       │   └── Footer
│       ├── RegisterScreen
│       │   ├── Header
│       │   ├── NumericInput (PIN)
│       │   ├── CurrencyInput (Deposit)
│       │   └── Footer
│       └── ExitScreen
```

## Development Workflow

### Day-to-Day Development

1. **Start development mode**
   ```bash
   npm run dev
   ```

2. **Make code changes** - Files are watched and rebuilt automatically

3. **Run the application** (in another terminal)
   ```bash
   npm start
   ```

4. **Run tests** as you develop
   ```bash
   npm run test:watch
   ```

5. **Check types** before committing
   ```bash
   npm run typecheck
   ```

6. **Format and lint** before committing
   ```bash
   npm run format
   npm run lint
   ```

### Adding a New Screen

1. **Create component** in `src/components/screens/`
   ```typescript
   // src/components/screens/MyScreen.tsx
   import React from 'react';
   import { Box, Text } from 'ink';
   
   interface MyScreenProps {
     onBack: () => void;
   }
   
   export const MyScreen: React.FC<MyScreenProps> = ({ onBack }) => {
     return (
       <Box flexDirection="column">
         <Text>My New Screen</Text>
       </Box>
     );
   };
   ```

2. **Add state** to `src/types/navigation.ts`
   ```typescript
   export enum AppState {
     // ... existing states
     MY_SCREEN = 'MY_SCREEN',
   }
   ```

3. **Update App.tsx** to render new screen
   ```typescript
   case AppState.MY_SCREEN:
     return <MyScreen onBack={() => navigateTo(AppState.HOME)} />;
   ```

4. **Add tests** in `tests/components/screens/MyScreen.test.ts`

### Adding a New Service

1. **Create service** in `src/services/`
   ```typescript
   // src/services/MyService.ts
   import { IStorage } from './IStorage.js';
   
   export class MyService {
     constructor(private storage: IStorage) {}
     
     async doSomething(): Promise<void> {
       // Implementation
     }
   }
   ```

2. **Add to ServiceContext** in `src/contexts/ServiceContext.tsx`
   ```typescript
   const myService = new MyService(storage);
   
   // Add to context value
   myService,
   ```

3. **Export hook** for accessing service
   ```typescript
   export const useMyService = () => {
     const context = useContext(ServiceContext);
     return context.myService;
   };
   ```

4. **Add tests** in `tests/services/MyService.test.ts`

## Code Style Guidelines

### TypeScript

- **Use strict mode** - All code must be type-safe
- **Explicit types** for function parameters and returns
- **Interfaces** for object shapes, **types** for unions
- **Avoid `any`** - Use `unknown` if type is truly unknown
- **Named exports** preferred over default exports

```typescript
// Good
export interface Account {
  accountNumber: string;
  balance: number;
}

export const formatBalance = (amount: number): string => {
  return `$${(amount / 100).toFixed(2)}`;
};

// Avoid
export default function format(x: any) {
  return '$' + x;
}
```

### React Components

- **Functional components** only (no classes)
- **Hooks** for state and side effects
- **Props interface** for all components
- **Explicit return types** for components

```typescript
// Good
interface MyComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ value, onChange }) => {
  const [localState, setLocalState] = useState<string>('');
  
  return <Box><Text>{value}</Text></Box>;
};
```

### React Ink Best Practices

- Use `<Box>` for layout, `<Text>` for content
- Use `flexDirection="column"` for vertical stacking
- Handle keyboard input with `useInput` hook
- Keep components focused and single-purpose
- Extract reusable components to `common/`

```typescript
// Good layout
<Box flexDirection="column" padding={1}>
  <Box marginBottom={1}>
    <Text>Header</Text>
  </Box>
  <Box>
    <Text>Content</Text>
  </Box>
</Box>
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `LoginScreen`, `BalanceDisplay` |
| Files (Components) | PascalCase.tsx | `LoginScreen.tsx` |
| Services | PascalCase | `AuthService`, `TransactionService` |
| Functions | camelCase | `formatBalance`, `validatePin` |
| Variables | camelCase | `accountNumber`, `isLoading` |
| Constants | UPPER_SNAKE_CASE | `MAX_PIN_LENGTH`, `MIN_BALANCE` |
| Interfaces | PascalCase | `Account`, `Transaction` |
| Types | PascalCase | `AppState`, `TransactionType` |
| Enums | PascalCase | `AppState`, `TransactionStatus` |

### File Organization

- One component per file
- File name matches component name
- Related files grouped in directories
- Index files for clean imports

```typescript
// Good
import { AuthService } from './services/AuthService.js';
import { LoginScreen } from './components/screens/LoginScreen.js';

// Also good (with index.ts)
import { AuthService, TransactionService } from './services/index.js';
```

## Testing Strategy

### Test Organization

Tests mirror the source code structure:

```
tests/
├── components/       # Component tests
├── services/         # Service tests
├── models/           # Model validation tests
├── hooks/            # Hook tests
├── utils/            # Utility function tests
├── integration/      # Integration tests
└── e2e/              # End-to-end tests
```

### Unit Tests

Test individual functions and classes in isolation.

```typescript
// tests/services/AuthService.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthService } from '../../src/services/AuthService.js';
import { MockStorage } from '../mocks/MockStorage.js';

describe('AuthService', () => {
  let authService: AuthService;
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    authService = new AuthService(storage, new SessionManager());
  });

  it('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### Integration Tests

Test interactions between multiple components/services.

```typescript
// tests/integration/LoginFlow.test.ts
import { render } from 'ink-testing-library';
import { App } from '../../src/components/App.js';

describe('Login Flow', () => {
  it('should complete full login workflow', async () => {
    const { stdin, lastFrame } = render(<App />);
    
    // Simulate user interactions
    stdin.write('0000012345');
    // ... more interactions
    
    expect(lastFrame()).toContain('HOME');
  });
});
```

### End-to-End Tests

Test complete user workflows from start to finish.

```typescript
// tests/e2e/FullWorkflow.test.ts
describe('Complete Banking Workflow', () => {
  it('should register, login, and perform transactions', async () => {
    // Test full user journey
  });
});
```

### Test Coverage Goals

| Category | Target Coverage |
|----------|----------------|
| Services | 100% |
| Models | 100% |
| Utils | 100% |
| Components (logic) | 80% |
| Overall | 80%+ |

Current coverage: **94.81%** for services, **100%** for models and utils.

### Running Tests

```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Specific test file
npm test -- LoginScreen.test.ts

# Update snapshots (if using)
npm test -- -u
```

## Adding New Features

### Feature Development Checklist

- [ ] Design the feature and API
- [ ] Add types/interfaces
- [ ] Implement core logic (service layer)
- [ ] Write unit tests for service
- [ ] Add UI components (if needed)
- [ ] Write component tests
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Test manually
- [ ] Submit PR

### Example: Adding Transfer Feature

1. **Add to TransactionService**
   ```typescript
   async transfer(
     fromAccount: string,
     toAccount: string,
     amount: number
   ): Promise<TransactionResult>
   ```

2. **Add UI in HomeScreen**
   - Add "Transfer" to menu
   - Create transfer input flow
   - Show confirmation

3. **Add Tests**
   - Unit tests for transfer logic
   - Integration test for transfer flow
   - Edge cases (insufficient funds, etc.)

4. **Update Docs**
   - Add to USAGE.md
   - Update ARCHITECTURE.md if needed

## Debugging Tips

### Console Logging

React Ink uses stdout, so use stderr for debug logs:

```typescript
console.error('Debug:', value);
// Or
process.stderr.write(`Debug: ${value}\n`);
```

### Component Debugging

```typescript
import { useEffect } from 'react';

export const MyComponent = () => {
  useEffect(() => {
    console.error('Component mounted');
    return () => console.error('Component unmounted');
  }, []);
  
  // ...
};
```

### Service Debugging

Add logging to services for troubleshooting:

```typescript
export class AuthService {
  async login(accountNumber: string, pin: string) {
    console.error('Login attempt:', { accountNumber });
    // ... rest of logic
  }
}
```

### Storage Debugging

Check JSON files directly:

```bash
# View accounts
cat data/accounts.json | jq

# View transactions
cat data/transactions.json | jq

# Reset data
rm data/*.json && npm run seed
```

### Type Debugging

Use TypeScript's type utilities:

```typescript
// Check what type TypeScript infers
type X = typeof myVariable;

// Force type error to see actual type
const x: never = myVariable; // Error shows actual type
```

## Common Issues and Solutions

### Build Errors

**Problem**: `Cannot find module` errors

**Solution**:
```bash
rm -rf dist node_modules
npm install --legacy-peer-deps
npm run build
```

### Test Failures

**Problem**: Tests fail after dependency updates

**Solution**:
```bash
npm run test -- --clearCache
npm test
```

### Type Errors

**Problem**: `Property does not exist on type` errors

**Solution**:
1. Run `npm run typecheck` for full error context
2. Check interface definitions
3. Ensure proper imports with `.js` extensions

### Terminal UI Issues

**Problem**: UI looks corrupted

**Solution**:
- Ensure terminal is at least 80x24
- Use modern terminal emulator
- Check ANSI color support

## Performance Considerations

### React Ink Performance

- Minimize state updates - causes re-renders
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Keep component tree shallow

```typescript
// Good
const formattedBalance = useMemo(
  () => formatBalance(balance),
  [balance]
);

// Avoid recalculating every render
```

### Storage Performance

- JSON file I/O is synchronous - acceptable for local CLI
- For large datasets, consider SQLite or other DB
- Cache frequently accessed data

## Contributing

### Pull Request Process

1. **Fork and clone** the repository
2. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make changes** following code style guidelines
4. **Add tests** for new functionality
5. **Run checks**
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```
6. **Commit changes** with clear messages
   ```bash
   git commit -m "feat: Add transfer functionality"
   ```
7. **Push branch** and create PR
8. **Respond to review** feedback

### Commit Message Format

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or tool changes

Examples:
```
feat(auth): Add two-factor authentication
fix(transaction): Prevent duplicate transaction IDs
docs(usage): Update login instructions
test(services): Add AuthService edge case tests
```

## Additional Resources

### Documentation

- [USAGE.md](./USAGE.md) - User guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical architecture
- [MIGRATION.md](./MIGRATION.md) - COBOL to React mapping
- [README.md](./README.md) - Project overview

### External Resources

- [React Documentation](https://react.dev/)
- [React Ink Documentation](https://github.com/vadimdemedes/ink)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Jest Documentation](https://jestjs.io/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

### Code Examples

Check these files for reference implementations:

- **Service Pattern**: `src/services/AuthService.ts`
- **React Context**: `src/contexts/ServiceContext.tsx`
- **Form Handling**: `src/components/screens/LoginScreen.tsx`
- **State Machine**: `src/services/NavigationManager.ts`
- **Data Validation**: `src/models/Account.ts`

---

**Happy Coding!** If you have questions, check the documentation or review existing code for patterns.
