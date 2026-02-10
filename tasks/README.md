# zBANK Modernization Plan - Task Overview

## Executive Summary

This modernization plan transforms the COBOL mainframe banking application into a modern **React CLI application** that runs **locally only** (no server deployment). The plan consists of **10 streamlined tasks** covering initialization, data layer, business logic, UI components, testing, and final integration.

## Technology Stack

### Original COBOL Application
- **Platform**: IBM z/OS Mainframe
- **Language**: COBOL
- **Transaction Monitor**: CICS
- **UI**: BMS (Basic Mapping Support) - 3270 Terminal
- **Storage**: VSAM KSDS (Key-Sequenced Data Set)
- **Build**: JCL (Job Control Language)

### Modern React CLI Application
- **Platform**: Local Node.js (v18+)
- **Language**: TypeScript
- **Framework**: React Ink (React for CLI)
- **UI**: Terminal/CLI with interactive components
- **Storage**: JSON file storage (local only)
- **Build**: npm scripts with tsup

## Migration Approach

### Key Principles
1. **Local Only**: No server, no deployment - runs entirely on user's machine
2. **Keep It Simple**: Streamlined to 10 tasks, focus on core functionality
3. **Feature Parity**: Match COBOL functionality plus modern improvements
4. **Gradual Enhancement**: Build incrementally, test continuously
5. **User-Friendly**: Modern CLI UX with colors, menus, and feedback

## Task Breakdown

### Phase 1: Foundation (Tasks 1-3)
**Goal**: Set up project structure, data models, and authentication

- **Task 01**: Initialize React CLI Application
  - Set up Node.js project with TypeScript
  - Install React Ink for CLI rendering
  - Create basic project structure
  - Configure build system

- **Task 02**: Design Data Models and Storage Layer
  - Define TypeScript interfaces (Account, Transaction)
  - Implement JSON file storage (replaces VSAM)
  - Create seed data from COBOL test accounts
  - Add data validation

- **Task 03**: Implement Authentication System
  - Build login service with PIN hashing (bcrypt) that mirrors COBOL authentication rules
  - Implement session management
  - Security improvement: PIN hashing only (no lockout or attempt tracking)

### Phase 2: Business Logic (Tasks 4-5)
**Goal**: Implement navigation and transaction processing

- **Task 04**: Create CLI Menu Navigation
  - Build state machine (Login → Home → Register)
  - Implement navigation context
  - Create app container component
  - Replicate COBOL screen state management

- **Task 05**: Implement Transaction Processing
  - Deposit transactions
  - Withdrawal transactions (matching COBOL behavior)
  - Transfer transactions (placeholder like COBOL)
  - Basic transaction processing

### Phase 3: User Interface (Tasks 6-8)
**Goal**: Build all screen components with React Ink

- **Task 06**: Build Login Screen Component
  - Account number input (10 digits)
  - PIN input (4 digits, masked)
  - Error messaging
  - Keyboard shortcuts (Q=Quit, R=Register)

- **Task 07**: Build Home/Transaction Screen
  - Balance display
  - Transaction menu (Deposit/Withdraw/Transfer)
  - Amount input with validation
  - Success/error feedback

- **Task 08**: Build Registration Screen
  - Placeholder-only registration UI (no real account creation)
  - Basic input fields matching COBOL skeleton behavior
  - Clear messaging that registration is not yet available
  - Navigation back to Login screen
  - Maintains parity with COBOL's partial/skeleton implementation

### Phase 4: Completion (Tasks 9-10)
**Goal**: Testing, documentation, and final polish

- **Task 09**: Testing and Documentation
  - Unit tests for all services
  - Integration tests for workflows
  - End-to-end CLI tests
  - User guide and developer documentation
  - Migration guide from COBOL

- **Task 10**: Final Integration and Polish
  - Wire all components together
  - Add splash screen with branding
  - Implement help system
  - Create executable CLI binary
  - Final testing and quality checks

## Feature Comparison: COBOL vs React CLI

| Feature | COBOL Status | React CLI Status | Notes |
|---------|-------------|------------------|-------|
| **Login Authentication** | ✓ Complete | ✓ Replicated | PIN hashing for security |
| **Balance Display** | ✓ Complete | ✓ Complete | Similar functionality |
| **Deposit** | ✓ Complete | ✓ Complete | Matches COBOL behavior |
| **Withdrawal** | ✓ Complete | ✓ Complete | Matches COBOL (no overdraft check) |
| **Transfer** | ✗ Not Implemented | ✗ Placeholder | Kept as placeholder like COBOL |
| **Registration** | ⚠ Partial | ⚠ Partial | Matches COBOL skeleton |
| **Transaction History** | ✗ None | ✗ None | Not in original COBOL |
| **Security** | ⚠ Plain text PINs | ✓ Improved | Hashed PINs (security only) |
| **Account Lockout** | ✗ None | ✗ None | Staying true to original |
| **Audit Trail** | ✗ None | ✗ None | Not in original COBOL |

## Data Migration

### COBOL VSAM Record (30 bytes)
```
WS-FILE-REC:
├─ WS-ACCNO    PIC 9(10)  [Account Number - 10 bytes]
├─ WS-PIN      PIC 9(10)  [PIN - 10 bytes, plain text]
└─ WS-BALANCE  PIC 9(10)  [Balance - 10 bytes, whole dollars]
```

### Modern JSON Storage
```json
{
  "accountNumber": "0000012345",
  "pin": "$2b$10$...",  // bcrypt hash
  "balance": 10000,     // cents
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-02-10T19:30:00Z",
  "isLocked": false,
  "failedLoginAttempts": 0
}
```

## Project Structure

```
zbank-cli/
├── src/
│   ├── components/
│   │   ├── App.tsx              # Main app container
│   │   ├── SplashScreen.tsx     # Branded splash
│   │   ├── common/              # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── NumericInput.tsx
│   │   │   └── CurrencyInput.tsx
│   │   └── screens/             # Screen components
│   │       ├── LoginScreen.tsx
│   │       ├── HomeScreen.tsx
│   │       ├── RegisterScreen.tsx
│   │       └── HelpScreen.tsx
│   ├── services/                # Business logic
│   │   ├── AuthService.ts
│   │   ├── TransactionService.ts
│   │   ├── JsonStorage.ts
│   │   └── AccountNumberService.ts
│   ├── models/                  # Data models
│   │   ├── Account.ts
│   │   └── Transaction.ts
│   ├── utils/                   # Utilities
│   │   ├── crypto.ts
│   │   ├── validation.ts
│   │   ├── formatter.ts
│   │   └── storage-init.ts
│   ├── contexts/                # React contexts
│   │   └── NavigationContext.tsx
│   ├── hooks/                   # Custom hooks
│   │   └── useKeyboard.ts
│   └── index.tsx                # Entry point
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── data/                        # Local data storage
│   ├── accounts.json
│   └── transactions.json
├── docs/                        # Documentation
│   ├── overview.md              # Original COBOL overview
│   └── tasks/                   # This directory
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── jest.config.js
└── README.md
```

## Installation and Usage

### Development
```bash
# Clone repository
git clone https://github.com/Johann-Foerster/zBANK.git
cd zBANK

# Install dependencies
npm install

# Run in dev mode (with hot reload)
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run production build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Test Accounts

After initialization, these accounts will be available:

| Account Number | PIN  | Initial Balance |
|---------------|------|-----------------|
| 0000012345    | 1111 | $100.00         |
| 1234567890    | 1234 | $200.00         |

## Success Criteria

### Functional Requirements
- [x] User can log in with account number and PIN
- [x] User can view account balance
- [x] User can deposit funds
- [x] User can withdraw funds (allows negative balances like COBOL)
- [x] User can access registration screen (skeleton only, no account creation)
- [x] Application runs locally without server
- [x] Data persists between sessions

### Non-Functional Requirements
- [x] TypeScript with strict mode
- [x] Test coverage > 80%
- [x] Clear error messages
- [x] User-friendly CLI interface
- [x] Complete documentation
- [x] Secure PIN storage (hashed)
- [x] Fast startup time (<2 seconds)

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Foundation | 1-3 | 3-4 days |
| Phase 2: Business Logic | 4-5 | 2-3 days |
| Phase 3: User Interface | 6-8 | 3-4 days |
| Phase 4: Completion | 9-10 | 2-3 days |
| **Total** | **10 tasks** | **10-14 days** |

## Risk Mitigation

### Technical Risks
- **Storage Performance**: JSON files are fine for local use with small datasets
- **Concurrent Access**: Single-user CLI app, no concurrency issues
- **Data Loss**: Regular file backups recommended

### Scope Management
- Focus on core features first
- Keep it simple - no server deployment
- Defer advanced features (multi-currency, interest, etc.)

## Next Steps

1. **Start with Task 01**: Initialize the React CLI project
2. **Follow in Order**: Complete tasks sequentially 1-10
3. **Test Continuously**: Run tests after each task
4. **Document as You Go**: Update README with new features
5. **Review COBOL**: Reference `docs/overview.md` for original specs

## Questions?

For questions or issues during modernization:
- Review the original COBOL overview: `docs/overview.md`
- Check each task document in `tasks/` directory
- Each task has detailed implementation steps and acceptance criteria

---

**Let's modernize zBANK! 🏦 → 💻**
