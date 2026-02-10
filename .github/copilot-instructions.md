# GitHub Copilot Instructions for zBANK

## Project Overview

zBANK is a dual-architecture banking application that bridges legacy mainframe technology with modern development:

1. **Legacy COBOL Mainframe Application**: Original banking system using COBOL, CICS, BMS, and VSAM
2. **Modern TypeScript CLI**: React Ink-based CLI application that modernizes the banking interface

## Repository Structure

```
zBANK/
├── *.cbl files              # COBOL mainframe source files
├── docs/                    # Project documentation
├── zbank-cli/               # Modern TypeScript CLI application
│   ├── src/                 # TypeScript source code
│   ├── tests/               # Test files
│   └── dist/                # Build output (auto-generated)
├── img/                     # Images and screenshots
└── tasks/                   # Project task documentation
```

## General Guidelines

### Code Quality
- Write clean, maintainable code that follows established patterns in the codebase
- Maintain consistency with existing code style in each language/technology
- Add comments only when they provide value beyond what the code itself expresses

### Security
- Never commit secrets, API keys, or credentials
- Follow secure coding practices appropriate for each technology
- Be mindful of security considerations in banking applications (authentication, data validation, etc.)

### Testing
- Run existing tests before making changes to understand baseline behavior
- Add tests for new functionality that follow existing test patterns
- For the TypeScript CLI, ensure type checking passes with `npm run typecheck`

### Documentation
- Update README.md files when making significant changes
- Keep documentation synchronized with code changes
- Document any setup or installation steps for new dependencies

## Technology-Specific Guidelines

### COBOL Mainframe Code
- Preserve the original COBOL coding style and conventions
- Be aware that this is a legacy system; changes should be minimal and carefully considered
- Understand the interdependencies: CICS → BMS → VSAM
- Changes to COBOL files may require recompilation via JCL scripts

### TypeScript CLI (zbank-cli/)
- Follow the existing React Ink patterns for UI components
- Use TypeScript strict mode - all code must be type-safe
- Format code with Prettier before committing: `npm run format`
- Lint code with ESLint: `npm run lint`
- Build the project to verify changes: `npm run build`
- Use functional React components with hooks

## Build and Development Workflow

### For COBOL Mainframe
- COBOL compilation requires mainframe environment (z/OS)
- JCL scripts in repository document the build process
- VSAM file operations require proper CICS setup

### For TypeScript CLI
```bash
cd zbank-cli
npm install           # Install dependencies
npm run typecheck    # Verify TypeScript types
npm run lint         # Check code quality
npm run build        # Build the application
npm run dev          # Development mode with hot reload
npm start            # Run the built application
```

## Commit Guidelines
- Write clear, descriptive commit messages
- Keep commits focused on a single logical change
- Reference issue numbers when applicable

## Dependencies
- Only add new dependencies when absolutely necessary
- Check for security vulnerabilities in dependencies
- Keep dependencies up to date, especially security patches
- For TypeScript CLI, use npm for package management

## What to Avoid
- Don't remove or modify working code unless fixing a bug or implementing a specific requirement
- Don't add build artifacts or `node_modules` to version control
- Don't break backward compatibility without discussion
- Don't modify the COBOL code unless specifically required - it represents a working legacy system
