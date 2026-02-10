# Task 01: Initialize React CLI Application

## Objective
Set up the foundational structure for a React-based CLI application that will replace the COBOL mainframe banking system.

## Background
The current zBANK application runs on IBM mainframe (z/OS) using COBOL, CICS, BMS, and VSAM. We need to create a modern Node.js-based CLI application using React Ink for the terminal UI.

## Requirements

### Technology Stack
- **Runtime**: Node.js (v18 or higher)
- **Language**: TypeScript for type safety
- **CLI Framework**: React Ink (React for interactive CLI applications)
- **Build Tool**: Vite or webpack
- **Package Manager**: npm or yarn
- **Testing**: Jest and React Testing Library

### Application Structure
```
zbank-cli/
├── src/
│   ├── components/     # React Ink UI components
│   ├── models/         # Data models
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── index.tsx       # Application entry point
├── tests/              # Test files
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Deliverables

1. **Initialize Node.js Project**
   - Create `package.json` with proper metadata
   - Set up TypeScript configuration
   - Configure build and dev scripts

2. **Install Core Dependencies**
   - `react` and `react-dom`
   - `ink` (React for CLI)
   - `ink-text-input`, `ink-select-input` (CLI input components)
   - TypeScript and type definitions

3. **Install Development Dependencies**
   - `@types/react`, `@types/node`
   - Testing framework (Jest)
   - ESLint and Prettier for code quality
   - Build tools (tsup, esbuild, or webpack)

4. **Create Basic CLI Entry Point**
   - Set up `src/index.tsx` with a simple "Hello zBANK" component
   - Configure executable entry point in `package.json`
   - Add shebang for CLI execution

5. **Configure Build System**
   - Set up TypeScript compilation
   - Configure bundle output for CLI executable
   - Set up development watch mode

6. **Create README**
   - Document project purpose
   - Installation instructions
   - Basic usage guide
   - Development setup

## Acceptance Criteria

- [x] Node.js project initialized with package.json
- [x] TypeScript configured with strict mode
- [x] React Ink installed and working
- [x] Basic "Hello World" CLI app runs successfully
- [x] Build scripts produce executable CLI binary
- [x] Development mode supports hot reload
- [x] README documents setup and usage

## Implementation Steps

1. Run `npm init -y` or `yarn init -y`
2. Install dependencies:
   ```bash
   npm install react ink
   npm install -D typescript @types/react @types/node
   npm install -D tsup ink-testing-library jest
   ```
3. Create `tsconfig.json` with appropriate settings
4. Create `src/index.tsx` with basic Ink component
5. Add build and dev scripts to `package.json`
6. Test CLI runs: `node dist/index.js`
7. Configure as executable: add shebang and chmod +x

## Testing
- Verify CLI starts without errors
- Check that help text displays
- Ensure development mode watches files

## Notes
- Use `ink` version 4.x or higher for React 18 support
- Consider `ink-gradient`, `ink-big-text` for branded splash screen
- Plan for state management (React Context or Zustand)
- Keep COBOL state machine pattern in mind for navigation

## Related Tasks
- Task 02: Design Data Models and Storage Layer
- Task 03: Implement Authentication System
- Task 04: Create CLI Menu Navigation

## References
- [React Ink Documentation](https://github.com/vadimdemedes/ink)
- [Node.js CLI Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)
- COBOL application overview: `docs/overview.md`
