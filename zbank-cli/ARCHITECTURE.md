# zBANK CLI - Technical Architecture

This document provides a comprehensive overview of the technical architecture of the zBANK CLI application.

## Table of Contents

- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Layer Architecture](#layer-architecture)
- [Data Models](#data-models)
- [Service Layer](#service-layer)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Storage Architecture](#storage-architecture)

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Terminal (CLI)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              React Ink Rendering Engine                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Components (Screens + Common UI)                      │ │
│  └──────────────────────┬─────────────────────────────────┘ │
│                         │                                    │
│  ┌──────────────────────▼─────────────────────────────────┐ │
│  │  Contexts (Navigation + Service Injection)             │ │
│  └──────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Services (Auth, Transaction, Navigation, Session)     │ │
│  └──────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Access Layer                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Storage Interface (IStorage)                          │ │
│  │  Implementation (JsonStorage)                          │ │
│  └──────────────────────┬─────────────────────────────────┘ │
└─────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Persistence Layer (JSON Files)                  │
│  • accounts.json                                             │
│  • transactions.json                                         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js v18+ | JavaScript runtime environment |
| Language | TypeScript 5.x | Type-safe JavaScript |
| UI Framework | React Ink 6.x | Terminal UI with React paradigm |
| State Management | React Context | Dependency injection and state |
| Build Tool | tsup (esbuild) | Fast TypeScript bundling |
| Test Framework | Jest + ts-jest | Unit and integration testing |
| Data Validation | Zod 4.x | Runtime schema validation |
| Cryptography | bcrypt 6.x | PIN hashing |
| Storage | JSON Files | Local file-based persistence |

## Architecture Patterns

### 1. Layered Architecture

The application follows a strict layered architecture where each layer only depends on layers below it:

```
Presentation → Application → Business Logic → Data Access → Persistence
```

**Benefits**:
- Clear separation of concerns
- Easy to test each layer independently
- Flexible - can swap implementations

### 2. Dependency Injection

Services are injected via React Context instead of direct instantiation:

```typescript
// Bad
const authService = new AuthService(new JsonStorage(), new SessionManager());

// Good
const authService = useAuth(); // Injected via context
```

**Benefits**:
- Loose coupling
- Easy mocking for tests
- Single source of truth for instances

### 3. Repository Pattern

Storage operations abstracted behind `IStorage` interface:

```typescript
interface IStorage {
  getAccount(accountNumber: string): Promise<Account | null>;
  createAccount(account: CreateAccountInput): Promise<Account>;
  updateAccount(accountNumber: string, updates: Partial<Account>): Promise<Account>;
  // ... more methods
}
```

**Benefits**:
- Can swap storage implementations (JSON → SQLite → PostgreSQL)
- Consistent API across storage types
- Easy to mock in tests

### 4. State Machine

Navigation managed as a finite state machine:

```typescript
enum AppState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  EXIT = 'EXIT',
}
```

**Benefits**:
- Predictable navigation flow
- Easy to visualize and reason about
- Matches COBOL application structure

### 5. Schema Validation

Runtime type checking with Zod schemas:

```typescript
const AccountSchema = z.object({
  accountNumber: z.string().length(10).regex(/^\d+$/),
  pin: z.string().min(1),
  balance: z.number().int(),
  // ...
});
```

**Benefits**:
- Catch validation errors at runtime
- Type-safe after validation
- Self-documenting schemas

## Layer Architecture

### Presentation Layer

**Location**: `src/components/`

**Responsibility**: Render UI and handle user interactions

**Components**:
- **Screens**: Full-screen views (Login, Home, Register, Exit)
- **Common**: Reusable UI components (Header, Footer, Inputs)

**Key Principles**:
- No business logic in components
- Props for data and callbacks
- Keyboard input handling
- Visual presentation only

Example:
```typescript
export const LoginScreen: React.FC<LoginScreenProps> = ({ onSuccess }) => {
  const authService = useAuth(); // Get service from context
  
  const handleLogin = async () => {
    const result = await authService.login(account, pin); // Delegate to service
    if (result.success) onSuccess();
  };
  
  return <Box>...</Box>; // Just render UI
};
```

### Application Layer

**Location**: `src/contexts/`, `src/hooks/`

**Responsibility**: Application state and dependency injection

**Components**:
- **NavigationContext**: Current screen and navigation logic
- **ServiceContext**: Service instances (DI container)
- **Custom Hooks**: `useKeyboard`, `useAuth`, etc.

**Key Principles**:
- Provide shared state across components
- Inject service dependencies
- Custom hooks for reusable logic

Example:
```typescript
export const ServiceContext = createContext<ServiceContextValue | null>(null);

export const ServiceProvider: React.FC<Props> = ({ children }) => {
  const storage = new JsonStorage();
  const authService = new AuthService(storage, sessionManager);
  
  return (
    <ServiceContext.Provider value={{ authService, storage, ... }}>
      {children}
    </ServiceContext.Provider>
  );
};
```

### Business Logic Layer

**Location**: `src/services/`

**Responsibility**: Implement business rules and operations

**Services**:
- **AuthService**: Authentication and authorization
- **TransactionService**: Deposit, withdrawal, transfer logic
- **NavigationManager**: State machine for screens
- **SessionManager**: User session management

**Key Principles**:
- Pure business logic (no UI concerns)
- Use storage layer for data access
- Return structured results
- Throw errors for exceptional cases

Example:
```typescript
export class AuthService {
  async login(accountNumber: string, pin: string): Promise<AuthResult> {
    // 1. Validate inputs
    if (!isValidAccountNumber(accountNumber)) {
      return { success: false, error: 'Invalid account number' };
    }
    
    // 2. Get account from storage
    const account = await this.storage.getAccount(accountNumber);
    
    // 3. Verify PIN
    const isValid = await verifyPin(pin, account.pin);
    
    // 4. Create session
    if (isValid) {
      this.sessionManager.setSession(account);
    }
    
    return { success: isValid, account };
  }
}
```

### Data Access Layer

**Location**: `src/services/IStorage.ts`, `src/services/JsonStorage.ts`

**Responsibility**: Abstract data persistence operations

**Components**:
- **IStorage**: Interface defining storage operations
- **JsonStorage**: Implementation using JSON files

**Key Principles**:
- Interface-based design
- Async operations (future-proof for DB)
- Transactional semantics where needed

Example:
```typescript
export class JsonStorage implements IStorage {
  async getAccount(accountNumber: string): Promise<Account | null> {
    const data = await this.loadData();
    return data.accounts.find(a => a.accountNumber === accountNumber) || null;
  }
  
  async updateAccount(accountNumber: string, updates: Partial<Account>): Promise<Account> {
    const data = await this.loadData();
    // ... update logic
    await this.saveData(data);
    return updatedAccount;
  }
}
```

### Persistence Layer

**Location**: `data/` directory (runtime)

**Responsibility**: Physical data storage

**Files**:
- `accounts.json`: Account records
- `transactions.json`: Transaction history

**Format**:
```json
{
  "accounts": [
    {
      "accountNumber": "0000012345",
      "pin": "$2b$10$...",  // bcrypt hash
      "balance": 10000,      // cents
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "transactions": [
    {
      "id": "uuid-here",
      "accountNumber": "0000012345",
      "type": "deposit",
      "amount": 5000,
      "balanceBefore": 10000,
      "balanceAfter": 15000,
      "status": "completed",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Data Models

### Account Model

```typescript
interface Account {
  accountNumber: string;    // 10 digits, unique
  pin: string;             // bcrypt hash of 4-digit PIN
  balance: number;         // in cents (integer)
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

**Validation**:
- Account number: exactly 10 digits
- PIN: bcrypt hash (stored), 4 digits (input)
- Balance: integer (cents), can be negative
- Timestamps: ISO 8601 format

### Transaction Model

```typescript
interface Transaction {
  id: string;              // UUID v4
  accountNumber: string;   // 10 digits
  type: TransactionType;   // 'deposit' | 'withdrawal' | 'transfer'
  amount: number;          // in cents (positive)
  balanceBefore: number;   // in cents (integer)
  balanceAfter: number;    // in cents (integer)
  description?: string;    // optional note
  status: TransactionStatus; // 'pending' | 'completed' | 'failed'
  timestamp: string;       // ISO 8601 timestamp
}

enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  TRANSFER = 'transfer',
}

enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

## Service Layer

### AuthService

**Purpose**: Handle authentication and session management

**Methods**:
```typescript
class AuthService {
  login(accountNumber: string, pin: string): Promise<AuthResult>
  logout(): Promise<void>
  getCurrentUser(): Account | null
  isAuthenticated(): boolean
  changePin(oldPin: string, newPin: string): Promise<boolean>
}
```

**Dependencies**:
- `IStorage`: For account lookup
- `SessionManager`: For session state

**Features**:
- PIN verification with bcrypt
- Session creation/destruction
- Account locking/unlocking
- No failed attempt tracking (COBOL parity)

### TransactionService

**Purpose**: Process banking transactions

**Methods**:
```typescript
class TransactionService {
  deposit(accountNumber: string, amount: number): Promise<TransactionResult>
  withdraw(accountNumber: string, amount: number): Promise<TransactionResult>
  transfer(from: string, to: string, amount: number): Promise<TransactionResult>
  getBalance(accountNumber: string): Promise<number>
  getTransactionHistory(accountNumber: string, limit?: number): Promise<Transaction[]>
}
```

**Dependencies**:
- `IStorage`: For account and transaction data

**Features**:
- Amount validation (positive, integer cents)
- Balance updates
- Transaction recording with before/after snapshots
- Overdraft allowed (COBOL parity)
- Transfer not implemented (COBOL parity)

### NavigationManager

**Purpose**: Manage application state machine

**Methods**:
```typescript
class NavigationManager {
  getCurrentState(): AppState
  navigateTo(state: AppState): void
  goBack(): boolean
  canGoBack(): boolean
  getHistory(): AppState[]
  clearHistory(): void
  reset(state?: AppState): void
}
```

**Features**:
- State machine transitions
- Navigation history stack
- Back navigation
- State reset

**State Transitions**:
```
LOGIN ──login──> HOME
       register> REGISTER ──success──> LOGIN
                                     cancel> LOGIN
HOME ──quit──> EXIT
```

### SessionManager

**Purpose**: Manage user session state

**Methods**:
```typescript
class SessionManager {
  setSession(account: Account): void
  clearSession(): void
  getSession(): Account | null
  isSessionActive(): boolean
  getLoginTime(): Date | null
  updateSession(account: Account): void
}
```

**Features**:
- In-memory session storage
- Login timestamp tracking
- Session update on account changes

## Component Hierarchy

### Screen Components

#### LoginScreen

**Purpose**: User authentication

**State**:
- `accountNumber`: string
- `pin`: string
- `error`: string
- `isLoading`: boolean
- `focusedField`: 'account' | 'pin'

**User Flow**:
1. Enter account number (10 digits)
2. Tab to PIN field
3. Enter PIN (4 digits, masked)
4. Submit with Enter
5. Navigate to HOME on success

**Keyboard Shortcuts**:
- `Q`: Quit application
- `R`: Go to registration
- `Tab`: Switch fields
- `Enter`: Submit

#### HomeScreen

**Purpose**: Main banking interface

**State**:
- `selectedAction`: 'deposit' | 'withdraw' | 'quit'
- `amount`: string (for transaction input)
- `isProcessing`: boolean
- `message`: string (success/error)

**User Flow**:
1. View balance
2. Select action from menu
3. Enter amount (for deposit/withdraw)
4. Confirm transaction
5. View updated balance

**Keyboard Shortcuts**:
- `↑/↓`: Navigate menu
- `Enter`: Select action
- `Q`: Quick logout
- `Esc`: Cancel transaction

#### RegisterScreen

**Purpose**: New account creation

**State**:
- `accountNumber`: string (auto-generated)
- `pin`: string
- `confirmPin`: string
- `initialDeposit`: string
- `error`: string
- `step`: number

**User Flow**:
1. View auto-generated account number
2. Enter PIN
3. Confirm PIN
4. Enter initial deposit (optional)
5. Confirm and create account
6. Return to login

**Keyboard Shortcuts**:
- `Enter`: Next step
- `Y`: Confirm registration
- `N`: Cancel registration
- `Esc`: Go back

### Common Components

#### NumericInput

**Purpose**: Input for account numbers and PINs

**Props**:
```typescript
interface NumericInputProps {
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  mask?: boolean;        // For PINs
  focus?: boolean;
  placeholder?: string;
}
```

**Features**:
- Only accepts digits
- Auto-truncation at maxLength
- Optional masking (****)
- Visual focus indicator

#### CurrencyInput

**Purpose**: Input for dollar amounts

**Props**:
```typescript
interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  focus?: boolean;
}
```

**Features**:
- Accepts digits and decimal point
- Max 2 decimal places
- Real-time validation
- Dollar sign in display

#### BalanceDisplay

**Purpose**: Formatted balance display

**Props**:
```typescript
interface BalanceDisplayProps {
  balance: number;  // in cents
  label?: string;
}
```

**Features**:
- Formats cents to dollars
- Green for positive, red for negative
- Always 2 decimal places
- Dollar sign prefix

## State Management

### Navigation State

Managed by `NavigationContext`:

```typescript
interface NavigationContextValue {
  currentState: AppState;
  navigateTo: (state: AppState) => void;
  goBack: () => boolean;
  canGoBack: () => boolean;
}
```

Used throughout app for screen transitions.

### Session State

Managed by `SessionManager` (via `ServiceContext`):

```typescript
// In AuthService
async login(accountNumber: string, pin: string) {
  // ... authentication logic
  this.sessionManager.setSession(account);
}

// In components
const authService = useAuth();
const currentUser = authService.getCurrentUser(); // null or Account
```

### Component Local State

Each component manages its own UI state with `useState`:

```typescript
const [accountNumber, setAccountNumber] = useState('');
const [isLoading, setIsLoading] = useState(false);
```

## Data Flow

### Login Flow

```
User Input → LoginScreen → AuthService → JsonStorage
                ↓              ↓
         (validation)   (PIN verify)
                ↓              ↓
         Display Error  SessionManager
                           ↓
                    NavigationContext
                           ↓
                   Navigate to HOME
```

### Transaction Flow

```
User Input → HomeScreen → TransactionService → JsonStorage
                               ↓                    ↓
                        (validate amount)    (update account)
                               ↓                    ↓
                        (record transaction)  (update balance)
                               ↓
                        Return Result
                               ↓
                      Update UI / Display
```

### Registration Flow

```
User Input → RegisterScreen → AuthService → JsonStorage
                ↓                  ↓             ↓
         (collect info)     (hash PIN)    (create account)
                ↓                             ↓
         Confirm Details              Initial Deposit
                ↓                             ↓
         Create Account               Record Transaction
                ↓
         Navigate to LOGIN
```

## Security Architecture

### PIN Security

**Storage**:
- PINs hashed with bcrypt (cost factor: 10)
- Never stored in plaintext
- Hash includes random salt

**Verification**:
```typescript
// Hashing
const hash = await bcrypt.hash(pin, 10);

// Verification
const isValid = await bcrypt.compare(pin, hash);
```

### Session Security

**Current Implementation**:
- In-memory session storage (lost on restart)
- No session timeout
- Single session per user

**Future Enhancements** (not implemented):
- Session persistence
- Timeout after inactivity
- Multiple device support

### Input Validation

**Layers of Validation**:
1. **UI Layer**: Input masks, character filtering
2. **Component Layer**: Format validation
3. **Service Layer**: Business rule validation
4. **Model Layer**: Schema validation with Zod

Example:
```typescript
// UI: Only accept digits
const sanitized = input.replace(/\D/g, '');

// Component: Check length
if (sanitized.length !== 10) return error;

// Service: Validate with business rules
if (!isValidAccountNumber(accountNumber)) return error;

// Model: Runtime schema check
const validated = AccountSchema.parse(data);
```

## Storage Architecture

### JSON File Structure

**Accounts File** (`data/accounts.json`):
```json
{
  "accounts": [...]
}
```

**Transactions File** (`data/transactions.json`):
```json
{
  "transactions": [...]
}
```

### Storage Operations

**Read Flow**:
```
loadData() → fs.readFile() → JSON.parse() → return data
```

**Write Flow**:
```
saveData() → JSON.stringify() → fs.writeFile() → sync
```

**Concurrency**:
- Synchronous read/write (fine for local CLI)
- No locking mechanism (single user assumed)
- Future: Add file locking for multi-process

### Data Integrity

**Validation on Load**:
```typescript
const data = JSON.parse(fileContent);
// Validate with Zod schemas
const accounts = z.array(AccountSchema).parse(data.accounts);
```

**Backup Strategy** (not implemented):
- Could add automatic backups on write
- Could add transaction logs for recovery

## Performance Considerations

### React Ink Rendering

- Terminal rendering is fast (< 16ms)
- Minimize state updates
- Use memoization for expensive formatting

### Storage Performance

- JSON files small (< 1MB typical)
- Synchronous I/O acceptable for CLI
- In-memory caching could be added

### Optimization Opportunities

1. **Lazy Loading**: Load data only when needed
2. **Caching**: Cache frequently accessed accounts
3. **Indexes**: Add in-memory indexes for lookups
4. **Batch Writes**: Batch multiple updates

## Scalability Considerations

### Current Limitations

- JSON files don't scale to thousands of accounts
- No concurrent access support
- No distributed deployment

### Future Improvements

1. **Database Migration**: SQLite → PostgreSQL
2. **API Layer**: REST or GraphQL API
3. **Caching**: Redis for session/data
4. **Async Processing**: Queue for transactions

## Extension Points

### Adding New Storage Backend

1. Implement `IStorage` interface
2. Update `ServiceContext` to use new impl
3. No changes needed in services or components

### Adding New Transaction Types

1. Add to `TransactionType` enum
2. Implement in `TransactionService`
3. Add UI in `HomeScreen`
4. Add tests

### Adding New Authentication Methods

1. Extend `AuthService` with new method
2. Add UI components as needed
3. Update session management if needed

---

This architecture document is a living document. Update it as the system evolves.
