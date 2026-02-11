# zBANK CLI - Technical Architecture

Comprehensive technical design and architecture documentation for the zBANK CLI application.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Layer Architecture](#layer-architecture)
- [Data Models](#data-models)
- [Services](#services)
- [Navigation & State Machine](#navigation--state-machine)
- [Component Architecture](#component-architecture)
- [Security](#security)
- [Storage](#storage)
- [Migration from COBOL](#migration-from-cobol)

## System Overview

### High-Level Architecture

```
Terminal → React Ink UI → Services (Business Logic) → Storage → JSON Files
```

**Stack:**
- **Runtime**: Node.js v18+
- **Language**: TypeScript 5.x (strict mode)
- **UI**: React Ink 6.x
- **State**: React Context + Hooks
- **Storage**: JSON files (can migrate to SQLite/PostgreSQL)
- **Tests**: Jest + ts-jest + ink-testing-library
- **Validation**: Zod schemas
- **Security**: bcrypt for PINs

## Architecture Patterns

### 1. Layered Architecture
Strict separation: Presentation → Application → Business Logic → Data Access → Persistence

### 2. Dependency Injection
Services injected via React Context instead of direct instantiation.

### 3. Repository Pattern
Storage operations abstracted behind `IStorage` interface - can swap JSON → SQLite → PostgreSQL without changing business logic.

### 4. State Machine
Navigation managed as finite state machine (LOGIN → HOME → REGISTER → EXIT).

### 5. Schema Validation
Runtime type checking with Zod schemas for data integrity.


## Layer Architecture

### Presentation Layer (`src/components/`)
**Screens**: Full-screen views (Login, Home, Register, Exit)  
**Common**: Reusable UI (Header, Footer, NumericInput, CurrencyInput, BalanceDisplay, ErrorMessage)

**Principle**: No business logic - just render UI and handle user input.

### Application Layer (`src/contexts/`, `src/hooks/`)
- **NavigationContext**: Current screen and state machine
- **ServiceContext**: Dependency injection container  
- **useAuth, useKeyboard**: Custom hooks

**Principle**: Provide shared state and inject services.

### Business Logic Layer (`src/services/`)
- **AuthService**: Login, logout, PIN verification
- **TransactionService**: Deposit, withdrawal, balance
- **NavigationManager**: State machine logic
- **SessionManager**: User session state

**Principle**: Pure business logic, no UI concerns.

### Data Access Layer (`src/services/IStorage.ts`, `JsonStorage.ts`)
- **IStorage**: Abstract interface
- **JsonStorage**: JSON file implementation

**Principle**: Abstracted persistence - easy to swap implementations.

### Persistence Layer (`data/`)
- `accounts.json`: Account records
- `transactions.json`: Transaction history

## Data Models

### Account
```typescript
interface Account {
  accountNumber: string;    // 10 digits, unique
  pin: string;             // bcrypt hash of 4-digit PIN
  balance: number;         // in cents (integer)
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

**Key Points:**
- Balance in cents to avoid floating-point errors
- PINs hashed with bcrypt (never plain text)
- Negative balances allowed (COBOL parity - overdrafts)

### Transaction
```typescript
interface Transaction {
  id: string;              // UUID v4
  accountNumber: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;          // in cents (positive)
  balanceBefore: number;
  balanceAfter: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;       // ISO 8601
  description?: string;
}
```

**Key Points:**
- Complete audit trail with before/after snapshots
- UUID for unique IDs
- Amount always positive (type indicates direction)

## Services

### AuthService
```typescript
login(accountNumber, pin): Promise<AuthResult>
logout(): Promise<void>
getCurrentUser(): Account | null
```
- PIN verification with bcrypt
- Session creation/destruction
- No account lockout (COBOL parity)

### TransactionService
```typescript
deposit(accountNumber, amount): Promise<TransactionResult>
withdraw(accountNumber, amount): Promise<TransactionResult>
getBalance(accountNumber): Promise<number>
getTransactionHistory(accountNumber, limit?): Promise<Transaction[]>
```
- Amount validation (positive, in cents)
- Balance updates with transaction recording
- Overdrafts allowed (COBOL parity)

### NavigationManager
```typescript
getCurrentState(): AppState
navigateTo(state: AppState): void
goBack(): boolean
```
**State Transitions:**
```
LOGIN → (login) → HOME → (quit) → EXIT
LOGIN → (register) → REGISTER → (success/cancel) → LOGIN
```

### SessionManager
```typescript
setSession(account: Account): void
clearSession(): void
getSession(): Account | null
```
In-memory session storage (lost on restart).

## Navigation & State Machine

**States**: LOGIN → HOME → REGISTER → EXIT

**Implementation**: `NavigationManager` service with history stack for back navigation.

**Context**: `NavigationContext` provides navigation to all components.

**App.tsx**: Renders appropriate screen based on current state.

## Component Architecture

### Screens
- **LoginScreen**: Account/PIN input → AuthService → Navigate to HOME
- **HomeScreen**: Menu (deposit/withdraw/logout) → TransactionService → Update balance
- **RegisterScreen**: Auto-generate account → Collect PIN → Create account → LOGIN
- **ExitScreen**: Goodbye message → Process exit

### Common Components
- **NumericInput**: Digits only, configurable length, optional masking (for PINs)
- **CurrencyInput**: Currency format (XX.XX), validation, dollar sign prefix
- **BalanceDisplay**: Format cents to currency, color-coded (green/red)
- **ErrorMessage**: Standardized error display with icon
- **Header/Footer**: Consistent branding and keyboard hints

## Security

### PIN Security
- **Storage**: bcrypt hash with salt (cost factor: 10)
- **Input**: Masked with asterisks in UI
- **Verification**: `bcrypt.compare()` - timing attack resistant
- **COBOL Comparison**: Plain text → Hashed (major improvement)

### Input Validation
**Multi-layer approach:**
1. UI: Input filtering (digits only, etc.)
2. Component: Format validation (length, pattern)
3. Service: Business rule validation
4. Model: Zod schema validation

### Session Security
- In-memory storage (single user)
- No timeout (COBOL parity)
- Account locking via storage interface (like VSAM READ UPDATE)

## Storage

### JSON Files
- `data/accounts.json`: Map of account number → Account
- `data/transactions.json`: Array of transactions

### Operations
- **Atomic writes**: Write-to-temp-then-rename pattern
- **Caching**: In-memory cache, invalidated on writes
- **Locking**: In-memory lock set for concurrent access control

### Future: Database Migration
Easy to swap JsonStorage → SQLiteStorage → PostgreSQLStorage by implementing IStorage interface.

## Migration from COBOL

### Technology Mapping

| COBOL | React CLI | Notes |
|-------|-----------|-------|
| **z/OS Mainframe** | Node.js | Cross-platform runtime |
| **CICS** | Node.js Event Loop | Async transaction processing |
| **BMS Maps** | React Ink Components | Declarative UI |
| **VSAM KSDS** | JSON Files | Key-value storage |
| **COBOL Programs** | TypeScript Services | Type-safe logic |
| **JCL** | npm scripts | Build automation |
| **Plain PINs** | bcrypt Hashed PINs | Major security upgrade |

### Data Migration

**COBOL VSAM Record (30 bytes):**
```
Bytes 1-10:  Account Number (PIC 9(10))
Bytes 11-20: PIN (PIC 9(10), zero-padded: 1234 → 0000001234)
Bytes 21-30: Balance (PIC 9(10), whole dollars)
```

**React CLI Account:**
```typescript
{
  accountNumber: "0000012345",  // Same format
  pin: "$2b$10$abc...",         // Now bcrypt hashed
  balance: 10000,               // Now in cents
  createdAt: "2024-01-01...",   // NEW field
  updatedAt: "2024-01-01..."    // NEW field
}
```

### State Machine

**COBOL:** Numeric states (0=LOGIN, 1=HOME, 2=REGISTER)  
**React CLI:** Named enum (AppState.LOGIN, AppState.HOME, etc.)

Both implement same state machine logic with improved navigation (history stack, back button).

### Business Logic

**Example - Login:**

COBOL: Read file → Compare PIN → Set state  
React CLI: Get account → bcrypt verify → Create session → Navigate

Same business rules, improved security and error handling.

### Maintained COBOL Behavior

✅ **Overdrafts allowed** - Balance can go negative  
✅ **Unlimited login attempts** - No account lockout  
✅ **Same transaction types** - Deposit, withdrawal (transfer not implemented in COBOL either)

### Improvements over COBOL

✅ **PIN hashing** - bcrypt instead of plain text  
✅ **Transaction history** - Full audit trail  
✅ **Better validation** - Multi-layer with clear error messages  
✅ **Complete registration** - COBOL had partial implementation  
✅ **Type safety** - TypeScript prevents entire classes of bugs  
✅ **Automated tests** - 269 tests vs manual mainframe testing

---

## Extension Points

**New Storage Backend**: Implement `IStorage` interface  
**New Transaction Types**: Add to `TransactionType` enum, implement in `TransactionService`  
**New Authentication**: Extend `AuthService` with new methods  
**New Screens**: Add to `AppState` enum, create component, update `App.tsx`

## Performance

- **React Ink**: Fast terminal rendering (<16ms)
- **JSON Storage**: Acceptable for CLI with small datasets (<1MB)
- **Future**: Add caching, indexes, migrate to database for scale

---

This architecture balances modern development practices with COBOL application parity, creating a maintainable, testable, and extensible banking system.
