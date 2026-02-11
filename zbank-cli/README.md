# zBANK CLI

Modern CLI Banking System built with React Ink - A TypeScript-based replacement for the legacy COBOL mainframe application.

## Overview

zBANK CLI is a terminal-based banking application that brings the functionality of the traditional COBOL/CICS/VSAM mainframe system to a modern Node.js environment. Built with React Ink, it provides an interactive command-line interface with the type safety of TypeScript.

## Features

- 🏦 **Full Banking Operations**: Login, deposits, withdrawals, account registration
- 🔐 **Secure Authentication**: bcrypt-hashed PINs, session management
- ⚛️ **Modern UI**: Built with React Ink for interactive terminal experience
- 📘 **Type-Safe**: Full TypeScript with strict mode
- 💾 **Data Persistence**: JSON-based storage with transaction history
- 🎨 **Beautiful Graphics**: Gradient text, color-coded balances, loading states
- 🧪 **Well-Tested**: 269 tests with ~95% coverage

## Quick Start

### Prerequisites

- Node.js v18.0.0 or higher
- npm 8.0.0 or higher

### Installation

```bash
# Clone and navigate
git clone https://github.com/Johann-Foerster/zBANK.git
cd zBANK/zbank-cli

# Install dependencies
npm install

# Build and run
npm run build
npm start
```

### Test Accounts

For testing, use these pre-seeded accounts:

| Account Number | PIN  | Balance  |
|---------------|------|----------|
| 0000012345    | 1111 | $100.00  |
| 1234567890    | 1234 | $200.00  |

## Usage

### Basic Operations

1. **Login**: Enter your 10-digit account number and 4-digit PIN
2. **View Balance**: Displayed immediately after login
3. **Deposit**: Select "Deposit" and enter amount
4. **Withdraw**: Select "Withdraw" and enter amount (overdrafts allowed)
5. **Logout**: Select "Quit" or press Q

### Keyboard Shortcuts

**Login Screen:**
- `Tab` - Switch between fields
- `Enter` - Submit login
- `Q` - Quit application
- `R` - Go to registration

**Home Screen:**
- `↑/↓` - Navigate menu
- `Enter` - Select action
- `Q` - Quick logout
- `Esc` - Cancel action

## Development

### Available Scripts

```bash
npm run build       # Build production version
npm run dev         # Development mode with hot reload
npm start           # Run the CLI application
npm test            # Run test suite
npm run typecheck   # TypeScript type checking
npm run lint        # Lint source code
npm run format      # Format with Prettier
npm run seed        # Seed test accounts
```

### Project Structure

```
zbank-cli/
├── src/
│   ├── components/        # React Ink UI components
│   │   ├── screens/      # Full-screen views (Login, Home, Register, Exit)
│   │   └── common/       # Reusable UI components
│   ├── services/         # Business logic layer
│   ├── models/           # Data models and schemas
│   ├── contexts/         # React contexts for state/DI
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── index.tsx         # Application entry point
├── tests/                # Test suite (mirrors src structure)
├── data/                 # Application data (runtime)
└── dist/                 # Build output
```

### Adding Features

1. **Create Service** (business logic in `src/services/`)
2. **Add Components** (UI in `src/components/`)
3. **Write Tests** (in `tests/` matching src structure)
4. **Update Types** (TypeScript interfaces/types)
5. **Format & Lint** (`npm run format && npm run lint`)

### Code Style

- **TypeScript**: Strict mode, explicit types, avoid `any`
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Testing**: Unit tests for services, integration tests for flows

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical design.

## Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Test Statistics:**
- 269 tests across 15 test suites
- ~95% coverage for services, 100% for models/utils
- All tests passing

## Migration from COBOL

This application modernizes the legacy COBOL mainframe system while maintaining functional parity:

| COBOL | Modern Equivalent | Notes |
|-------|------------------|-------|
| **CICS TP Monitor** | Node.js Event Loop | Async transaction handling |
| **BMS Screens** | React Ink Components | Declarative UI |
| **VSAM Files** | JSON Storage | Can migrate to PostgreSQL |
| **COBOL Programs** | TypeScript Services | Type-safe business logic |
| **Plain Text PINs** | bcrypt Hashes | Major security improvement |

**Key Improvements:**
- ✅ Hashed PINs (bcrypt with salt)
- ✅ Transaction history and audit trail
- ✅ Better error messages and validation
- ✅ Full account registration
- ✅ Cross-platform (any OS with Node.js)

**Maintained COBOL Behavior:**
- ✅ Overdrafts allowed (balance can go negative)
- ✅ Unlimited login attempts
- ✅ Same transaction types (deposit, withdrawal)

## Troubleshooting

### Application Won't Start
```bash
npm run build
node --version  # Check v18+
rm -rf node_modules && npm install
```

### Test Failures
```bash
npm test -- --clearCache
```

### Display Issues
- Resize terminal to at least 80x24
- Use modern terminal (iTerm2, Windows Terminal)
- Ensure ANSI color support

### Reset Data
```bash
rm data/*.json
npm run seed
```

## Documentation

- **README.md** (this file) - Quick start and usage
- **ARCHITECTURE.md** - Technical architecture and design patterns
- **tests/README.md** - Testing guide and patterns

## Contributing

1. Fork and create a feature branch
2. Make your changes following code style
3. Add tests for new functionality
4. Run `npm run typecheck && npm run lint && npm test`
5. Submit a pull request

## License

ISC

---

*Modernizing mainframe banking for the 21st century* 🚀
