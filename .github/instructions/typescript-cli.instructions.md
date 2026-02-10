---
applyTo:
  - "zbank-cli/**"
excludeAgent:
  - code-review
---

# TypeScript CLI Instructions (zbank-cli)

## Overview
The zbank-cli is a modern CLI banking application built with:
- **React Ink**: Terminal UI framework using React
- **TypeScript**: Type-safe JavaScript with strict mode enabled
- **tsup**: Fast build tool powered by esbuild
- **Node.js**: Runtime environment (v18+)

## Project Structure
```
zbank-cli/
├── src/
│   ├── index.tsx        # Application entry point
│   ├── components/      # React Ink UI components (to be added)
│   ├── models/          # Data models (to be added)
│   ├── services/        # Business logic (to be added)
│   └── utils/           # Utility functions (to be added)
├── tests/               # Test files
├── dist/                # Build output (auto-generated, ignored by git)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
├── .prettierrc          # Prettier configuration
└── README.md            # Project documentation
```

## Code Style and Quality

### TypeScript
- Use **strict mode** - all code must be type-safe
- Prefer explicit types over implicit when it improves clarity
- Use `interface` for object types, `type` for unions/intersections
- Avoid `any` type - use `unknown` if type is truly unknown
- Enable all strict compiler options

### React Ink Patterns
- Use **functional components** with hooks (no class components)
- Follow React Ink best practices for terminal UI
- Use `<Box>` for layout, `<Text>` for content
- Implement proper keyboard navigation with `useInput` hook
- Handle terminal resize events appropriately

### Code Organization
- One component per file
- Export components as named exports
- Keep components focused and single-responsibility
- Extract business logic into services
- Use utility functions for shared code

### Naming Conventions
- **Components**: PascalCase (e.g., `LoginScreen`, `TransactionList`)
- **Files**: kebab-case for utilities, PascalCase for components (e.g., `login-screen.tsx`)
- **Variables/Functions**: camelCase (e.g., `accountBalance`, `processDeposit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_ATTEMPTS`)
- **Interfaces/Types**: PascalCase with descriptive names (e.g., `UserAccount`, `TransactionType`)

## Development Workflow

### Before Starting Work
```bash
cd zbank-cli
npm install              # Install dependencies
```

### During Development
```bash
npm run dev              # Start development mode with hot reload
npm run typecheck        # Verify TypeScript types
npm run lint            # Check code quality
npm run format          # Format code with Prettier
```

### Before Committing
```bash
npm run typecheck        # Must pass
npm run lint            # Must pass with no errors
npm run format          # Format all code
npm run build           # Must build successfully
npm test                # Run tests (when implemented)
```

## Dependencies Management

### Adding Dependencies
- Use `npm install <package>` for runtime dependencies
- Use `npm install -D <package>` for development dependencies
- **Always check for security vulnerabilities** before adding packages
- Prefer well-maintained packages with good TypeScript support
- Consider bundle size impact for CLI applications

### Recommended Packages (already in use)
- `ink` - Terminal UI framework
- `react` - Core React library
- `ink-text-input` - Text input component
- `ink-select-input` - Selection menu component
- `ink-big-text` - Large text display
- `ink-gradient` - Gradient text effects

### Development Tools
- `typescript` - TypeScript compiler
- `tsup` - Build tool
- `eslint` - Linting
- `prettier` - Code formatting
- `ink-testing-library` - Component testing

## Testing

### Test Structure
- Place test files in `tests/` directory
- Use `.test.ts` or `.test.tsx` suffix
- Follow existing test patterns when they exist
- Use `ink-testing-library` for component testing

### Test Guidelines
- Write tests for business logic in services
- Test React Ink components with ink-testing-library
- Mock external dependencies
- Test error conditions and edge cases

## Building and Running

### Development
```bash
npm run dev              # Hot reload development
```

### Production Build
```bash
npm run build            # Creates optimized bundle in dist/
npm start                # Run the built application
```

### Distribution
```bash
npm link                 # Make globally available as 'zbank'
zbank                    # Run from anywhere
```

## React Ink Best Practices

### Component Patterns
```typescript
import React, { useState } from 'react';
import { Box, Text } from 'ink';

export const MyComponent = () => {
  const [state, setState] = useState<string>('');
  
  return (
    <Box flexDirection="column">
      <Text color="green">Hello from MyComponent</Text>
    </Box>
  );
};
```

### Input Handling
```typescript
import { useInput } from 'ink';

export const InputComponent = () => {
  useInput((input, key) => {
    if (key.return) {
      // Handle Enter key
    }
    if (key.escape) {
      // Handle Escape key
    }
  });
  
  return <Text>Press Enter or Escape</Text>;
};
```

### State Management
- Use `useState` for component-local state
- Use `useContext` for shared state between components
- Keep state minimal and derived values computed

## Error Handling
- Handle errors gracefully with try-catch blocks
- Display user-friendly error messages in the terminal
- Log errors appropriately for debugging
- Don't crash the application on recoverable errors

## Performance Considerations
- React Ink re-renders on state changes - keep state updates minimal
- Avoid unnecessary re-renders with `useMemo` and `useCallback`
- Be mindful of terminal rendering performance with large datasets
- Use pagination for long lists

## Banking Application Context

### Functional Requirements (to be implemented in future tasks)
- User authentication (account number + PIN)
- Account balance display
- Deposit transactions
- Withdrawal transactions
- Account registration
- Transaction history

### Data Models (to be implemented)
- User accounts with account number, PIN, balance
- Transaction records with type, amount, timestamp
- Session management

### Security Considerations
- Never log or display sensitive data (PINs, full account numbers)
- Validate all user input
- Implement proper authentication
- Hash passwords/PINs before storage (when persistence is implemented)

## Troubleshooting

### TypeScript Errors
- Run `npm run typecheck` to see all type errors
- Check `tsconfig.json` for strict mode settings
- Ensure all dependencies have type definitions

### Build Errors
- Clear `dist/` directory: `rm -rf dist/`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for syntax errors in source files

### Runtime Errors
- Check Node.js version (must be v18+)
- Verify all dependencies are installed
- Look for missing imports or undefined variables

## Future Roadmap
This is **Task 01** of the modernization project. Future tasks will add:
- Data models and storage layer
- Authentication system
- Menu navigation
- Transaction processing
- Login, home, and registration screens
- Testing and documentation

## Migration from COBOL
When implementing features, reference the original COBOL application:
- See `docs/overview.md` for detailed COBOL implementation
- Maintain similar user experience and workflows
- Translate COBOL business logic to TypeScript
- Adapt VSAM storage concepts to modern persistence

## References
- [React Ink Documentation](https://github.com/vadimdemedes/ink)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React Documentation](https://react.dev/)
- Original COBOL application: `../docs/overview.md`
