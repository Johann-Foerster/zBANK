# zBANK CLI

Modern CLI Banking System built with React Ink - A TypeScript-based replacement for the legacy COBOL mainframe application.

## Overview

zBANK CLI is a terminal-based banking application that brings the functionality of the traditional COBOL/CICS/VSAM mainframe system to a modern Node.js environment. Built with React Ink, it provides an interactive command-line interface with the type safety of TypeScript.

## Features

- 🏦 Modern CLI banking interface
- ⚛️ Built with React Ink for interactive terminal UI
- 📘 Full TypeScript support for type safety
- 🚀 Fast builds with tsup
- 🎨 Beautiful terminal graphics with gradient text and big text display
- 🔧 Hot reload development mode

## Technology Stack

- **Runtime**: Node.js v18+
- **Language**: TypeScript
- **UI Framework**: React Ink 6.x
- **Build Tool**: tsup (powered by esbuild)
- **Package Manager**: npm

## Prerequisites

- Node.js v18.0.0 or higher
- npm 8.0.0 or higher

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Johann-Foerster/zBANK.git
cd zBANK/zbank-cli
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Usage

### Running the CLI

After building, you can run the CLI in multiple ways:

```bash
# Using npm script
npm start

# Direct execution
node dist/index.js

# Or after global installation
zbank
```

### Development Mode

For development with hot reload:

```bash
npm run dev
```

This will watch for changes in the `src/` directory and automatically rebuild.

## Available Scripts

- `npm run build` - Build the production version
- `npm run dev` - Start development mode with file watching
- `npm start` - Run the built CLI application
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Lint the source code
- `npm run format` - Format code with Prettier
- `npm test` - Run tests (to be implemented)

## Project Structure

```
zbank-cli/
├── src/
│   ├── components/     # React Ink UI components
│   ├── models/         # Data models
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── index.tsx       # Application entry point
├── tests/              # Test files
├── dist/               # Build output
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## Development

### Adding New Components

Create new React Ink components in the `src/components/` directory:

```typescript
import React from 'react';
import { Box, Text } from 'ink';

export const MyComponent = () => {
  return (
    <Box>
      <Text>Hello from MyComponent!</Text>
    </Box>
  );
};
```

### Type Safety

The project uses TypeScript with strict mode enabled. All code must pass type checking:

```bash
npm run typecheck
```

### Code Quality

Format your code before committing:

```bash
npm run format
```

Lint your code:

```bash
npm run lint
```

## Roadmap

This is Task 01 of the zBANK modernization project. Future tasks include:

- [ ] **Task 02**: Design Data Models and Storage Layer
- [ ] **Task 03**: Implement Authentication System
- [ ] **Task 04**: Create CLI Menu Navigation
- [ ] **Task 05**: Implement Transaction Processing
- [ ] **Task 06**: Build Login Screen
- [ ] **Task 07**: Build Home Screen
- [ ] **Task 08**: Build Registration Screen
- [ ] **Task 09**: Testing and Documentation
- [ ] **Task 10**: Final Integration

## Migration from COBOL

This application is designed to replace the legacy COBOL mainframe system while maintaining familiar banking operations:

- **CICS Transaction Processing** → React Ink interactive navigation
- **BMS Screens** → React Ink components
- **VSAM Storage** → Modern data persistence (to be implemented)
- **COBOL Business Logic** → TypeScript services

## References

- [React Ink Documentation](https://github.com/vadimdemedes/ink)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Node.js CLI Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)
- [Original COBOL Application](../docs/overview.md)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and type checking
4. Format and lint your code
5. Submit a pull request

## License

ISC

## Authors

zBANK Development Team

---

*Modernizing mainframe banking for the 21st century* 🚀
