# zBANK - Migration from COBOL to React CLI

This document explains how the original COBOL mainframe application was modernized to a React-based CLI application, maintaining functional parity while improving security, maintainability, and user experience.

## Table of Contents

- [Overview](#overview)
- [Technology Mapping](#technology-mapping)
- [Architecture Comparison](#architecture-comparison)
- [Data Structure Migration](#data-structure-migration)
- [State Machine Comparison](#state-machine-comparison)
- [Feature Parity Matrix](#feature-parity-matrix)
- [Business Logic Migration](#business-logic-migration)
- [Security Improvements](#security-improvements)
- [Migration Benefits](#migration-benefits)

## Overview

### Modernization Goals

1. **Preserve Functionality**: Maintain COBOL application behavior
2. **Improve Security**: Add PIN hashing and better validation
3. **Enhance UX**: Better error messages and user feedback
4. **Add Features**: Transaction history, better account management
5. **Maintain Parity**: Match COBOL behavior where appropriate (e.g., overdrafts)

### Migration Strategy

- **Incremental**: Migrate feature by feature
- **Test-Driven**: Write tests matching COBOL behavior
- **Documentation**: Map every COBOL concept to modern equivalent
- **Backwards Compatible**: Support COBOL data formats where applicable

## Technology Mapping

### Platform and Runtime

| COBOL Component | Modern Equivalent | Notes |
|----------------|-------------------|-------|
| **z/OS Mainframe** | **Node.js** | Cross-platform JavaScript runtime |
| **CICS TP Monitor** | **Node.js Event Loop** | Async I/O and transaction handling |
| **3270 Terminal** | **Modern Terminal/CLI** | iTerm2, Windows Terminal, etc. |
| **TSO/ISPF** | **Shell/Bash** | Command-line interface |
| **JCL Jobs** | **npm Scripts** | Build, test, deploy automation |

### Programming and UI

| COBOL Component | Modern Equivalent | Notes |
|----------------|-------------------|-------|
| **COBOL Language** | **TypeScript** | Type-safe JavaScript |
| **BMS Maps** | **React Ink Components** | Declarative UI components |
| **DFHMSD/DFHMDI/DFHMDF** | **React JSX** | Component composition |
| **SEND MAP/RECEIVE MAP** | **React State** | Reactive UI updates |
| **COMMAREA** | **React Context** | Shared state between screens |

### Data and Storage

| COBOL Component | Modern Equivalent | Notes |
|----------------|-------------------|-------|
| **VSAM KSDS** | **JSON Files** | Could migrate to SQLite/PostgreSQL |
| **File Record** | **TypeScript Interface** | Type-safe data models |
| **PIC Clauses** | **Zod Schemas** | Runtime validation |
| **REDEFINES** | **Union Types** | Type-safe field variations |
| **COMP-3** | **Number (cents)** | Integer arithmetic for money |

### Build and Deploy

| COBOL Component | Modern Equivalent | Notes |
|----------------|-------------------|-------|
| **JCL Compile** | **tsup Build** | TypeScript compilation |
| **CICS Install** | **npm install** | Dependency installation |
| **Load Module** | **dist/index.js** | Built application bundle |
| **CEMT Commands** | **npm scripts** | Operational commands |

## Architecture Comparison

### COBOL Architecture

```
3270 Terminal
    │
    ▼
CICS Transaction (ZBNK)
    │
    ├─→ BMS Maps (ZBANKSET)
    │   ├─ ZLOGIN
    │   ├─ ZHOME
    │   └─ ZRGSTR
    │
    ├─→ COBOL Program (ZBANK3)
    │   ├─ State Machine
    │   ├─ Business Logic
    │   └─ File Operations
    │
    └─→ VSAM File (VSAMZBNK)
        └─ KSDS Records (30 bytes)
```

### React CLI Architecture

```
Modern Terminal
    │
    ▼
Node.js Runtime
    │
    ├─→ React Ink (UI)
    │   ├─ LoginScreen
    │   ├─ HomeScreen
    │   └─ RegisterScreen
    │
    ├─→ Services (Business Logic)
    │   ├─ AuthService
    │   ├─ TransactionService
    │   ├─ NavigationManager
    │   └─ SessionManager
    │
    └─→ Storage Layer
        ├─ IStorage Interface
        └─ JsonStorage (accounts.json, transactions.json)
```

### Key Architectural Changes

| Aspect | COBOL | React CLI |
|--------|-------|-----------|
| **UI Pattern** | Procedural (SEND/RECEIVE) | Declarative (React) |
| **State Management** | COMMAREA + Working Storage | React Context + Hooks |
| **Navigation** | Goto/Perform statements | State Machine + Context |
| **Error Handling** | RESP codes | Try/Catch + Result types |
| **Concurrency** | CICS handles | Node.js async/await |
| **Testing** | Manual testing | Automated unit/integration tests |

## Data Structure Migration

### VSAM Record Layout

**COBOL Structure** (30 bytes):
```cobol
01 WS-FILE-REC.
   05 WS-ACCNO    PIC 9(10).  * Bytes 1-10: Account Number
   05 WS-PIN      PIC 9(10).  * Bytes 11-20: PIN (zero-padded)
   05 WS-BALANCE  PIC 9(10).  * Bytes 21-30: Balance (in whole dollars)
```

**TypeScript Equivalent**:
```typescript
interface Account {
  accountNumber: string;    // 10 digits
  pin: string;             // bcrypt hash (not stored as COBOL 10-digit)
  balance: number;         // in cents (not dollars)
  createdAt: string;       // NEW: ISO 8601 timestamp
  updatedAt: string;       // NEW: ISO 8601 timestamp
}
```

### Field-by-Field Comparison

| Field | COBOL | React CLI | Changes |
|-------|-------|-----------|---------|
| **Account Number** | `PIC 9(10)` | `string` (10 digits) | Same format, string type |
| **PIN** | `PIC 9(10)` (zero-padded) | `string` (bcrypt hash) | **SECURITY**: Now hashed |
| **Balance** | `PIC 9(10)` (dollars) | `number` (cents) | **PRECISION**: Cents vs dollars |
| **Created At** | N/A | `string` (ISO 8601) | **NEW FIELD** |
| **Updated At** | N/A | `string` (ISO 8601) | **NEW FIELD** |

### PIN Storage Evolution

**COBOL Approach**:
```cobol
* User enters: 1234
* Stored in VSAM: 0000001234 (10-digit zero-padded)
* Comparison: Numeric equality
```

**React CLI Approach**:
```typescript
// User enters: '1234'
// Hashed: '$2b$10$abc123...' (bcrypt hash with salt)
// Verification: bcrypt.compare(inputPin, storedHash)
```

**Key Improvements**:
- **Security**: Hashed with bcrypt (cost factor 10)
- **Salt**: Random salt per hash
- **One-way**: Cannot reverse to original PIN
- **Brute-force resistant**: Computationally expensive

### Balance Storage Evolution

**COBOL Approach**:
```cobol
* Balance: 100 (stored as 0000000100 - represents $100)
* Display: "100" -> user sees as $100.00
* Arithmetic: Integer addition/subtraction
```

**React CLI Approach**:
```typescript
// Balance: 10000 (represents $100.00 in cents)
// Display: formatBalance(10000) -> "$100.00"
// Arithmetic: Integer operations on cents
```

**Rationale for Cents**:
- **Precision**: No floating-point errors
- **Standard Practice**: Financial systems use smallest unit
- **Compatibility**: Easy to convert for display

## State Machine Comparison

### COBOL State Machine

**Implementation**:
```cobol
PERFORM UNTIL 1 = 2
   EVALUATE WS-STATE
      WHEN 0    * Login State
         EXEC CICS SEND MAP('ZLOGIN') END-EXEC
         EXEC CICS RECEIVE MAP('ZLOGIN') END-EXEC
         PERFORM LOGIN-LOGIC
      WHEN 1    * Home State
         EXEC CICS SEND MAP('ZHOME') END-EXEC
         EXEC CICS RECEIVE MAP('ZHOME') END-EXEC
         PERFORM HOME-LOGIC
      WHEN 2    * Register State (partial)
         MOVE 0 TO WS-STATE
   END-EVALUATE
END-PERFORM.
```

**States**:
- **State 0**: Login
- **State 1**: Home/Transactions
- **State 2**: Register (incomplete)

### React CLI State Machine

**Implementation**:
```typescript
enum AppState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  EXIT = 'EXIT',  // NEW
}

class NavigationManager {
  private currentState: AppState = AppState.LOGIN;
  private history: AppState[] = [];
  
  navigateTo(state: AppState): void {
    this.history.push(this.currentState);
    this.currentState = state;
  }
  
  goBack(): boolean {
    if (this.history.length > 0) {
      this.currentState = this.history.pop()!;
      return true;
    }
    return false;
  }
}
```

**Improvements over COBOL**:
- **Named States**: More readable than numeric
- **History Stack**: Back navigation support
- **Exit State**: Clean app termination
- **Type Safety**: TypeScript enums

### State Transition Comparison

**COBOL Transitions**:
```
0 (LOGIN) ──[valid credentials]──> 1 (HOME)
0 (LOGIN) ──[register]──> 2 (REGISTER) ──[incomplete]──> 0 (LOGIN)
1 (HOME)  ──[quit]──> 0 (LOGIN) [loops forever]
```

**React CLI Transitions**:
```
LOGIN ──[valid credentials]──> HOME
LOGIN ──[register]──> REGISTER ──[success]──> LOGIN
                              ──[cancel]──> LOGIN
HOME ──[quit]──> EXIT [terminates application]
```

**Key Differences**:
- **Exit State**: React CLI properly exits, COBOL loops indefinitely
- **Register Completion**: React CLI fully implements registration
- **Bidirectional**: React CLI supports back navigation

## Feature Parity Matrix

### Core Features

| Feature | COBOL Status | React CLI Status | Notes |
|---------|-------------|------------------|-------|
| **Login** | ✅ Complete | ✅ Complete | Full parity |
| **Balance Display** | ✅ Complete | ✅ Complete | Same functionality |
| **Deposit** | ✅ Complete | ✅ Complete | Enhanced with history |
| **Withdrawal** | ✅ Complete | ✅ Complete | Enhanced with history |
| **Overdrafts** | ✅ Allowed | ✅ Allowed | Maintained COBOL behavior |
| **Transfer** | ❌ Not Implemented | ✅ Complete | NEW in React CLI |
| **Registration** | ⚠️ Partial | ✅ Complete | Fully implemented |
| **Transaction History** | ❌ Not Available | ✅ Complete | NEW in React CLI |

### Authentication & Security

| Feature | COBOL | React CLI | Improvement |
|---------|-------|-----------|-------------|
| **PIN Storage** | Plain text (zero-padded) | bcrypt hash | ✅ Major security improvement |
| **PIN Format** | 4 digits → 10 digits | 4 digits → hash | ✅ More secure |
| **Failed Attempts** | Unlimited | Unlimited | ⚠️ Maintained for parity |
| **Account Locking** | VSAM lock during use | In-memory session lock | ✅ Improved |
| **Session Management** | CICS COMMAREA | SessionManager service | ✅ Better structure |

### Data Validation

| Feature | COBOL | React CLI | Improvement |
|---------|-------|-----------|-------------|
| **Account Number** | 10 digits, no validation | 10 digits, Zod schema | ✅ Runtime validation |
| **PIN Format** | 4 digits, numeric only | 4 digits, validated | ✅ Better validation |
| **Amount Validation** | Basic numeric check | Multi-layer validation | ✅ Comprehensive |
| **Balance Limits** | None | MAX_SAFE_INTEGER | ✅ Overflow protection |

### User Experience

| Feature | COBOL | React CLI | Improvement |
|---------|-------|-----------|-------------|
| **Error Messages** | Generic CICS errors | Specific, helpful messages | ✅ Much better UX |
| **Input Masking** | Basic | Enhanced with React Ink | ✅ Better security |
| **Loading States** | None | Spinner during async ops | ✅ User feedback |
| **Keyboard Shortcuts** | Limited | Comprehensive | ✅ Power user features |
| **Visual Design** | Basic 3270 | Modern with colors | ✅ Better aesthetics |

## Business Logic Migration

### Login Logic

**COBOL Implementation**:
```cobol
EXEC CICS READ
    DATASET(WS-FILE-NAME)
    INTO(WS-FILE-REC)
    RIDFLD(WS-ACC-INPUT)
    UPDATE
    RESP(WS-RESP)
END-EXEC.

IF WS-RESP = DFHRESP(NORMAL) THEN
    IF WS-PIN-INPUT = WS-PIN THEN
        MOVE 1 TO WS-STATE
    ELSE
        MOVE 'INVALID PIN' TO ERROR-MSG
    END-IF
ELSE
    MOVE 'ACCOUNT NOT FOUND' TO ERROR-MSG
END-IF.
```

**React CLI Implementation**:
```typescript
async login(accountNumber: string, pin: string): Promise<AuthResult> {
  // 1. Validate input format
  if (!isValidAccountNumber(accountNumber)) {
    return { success: false, error: 'Invalid account number format' };
  }
  
  if (!isValidPin(pin)) {
    return { success: false, error: 'Invalid PIN format' };
  }
  
  // 2. Retrieve account
  const account = await this.storage.getAccount(accountNumber);
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  // 3. Verify PIN (with bcrypt)
  const isValid = await verifyPin(pin, account.pin);
  if (!isValid) {
    return { success: false, error: 'Invalid PIN' };
  }
  
  // 4. Lock account (like VSAM READ UPDATE)
  await this.storage.lockAccount(accountNumber);
  
  // 5. Create session
  this.sessionManager.setSession(account);
  
  return { success: true, account };
}
```

**Enhancements**:
- Multi-layer validation
- Secure PIN verification
- Better error messages
- Type-safe return values
- Async/await for clean code

### Transaction Logic

**COBOL Deposit**:
```cobol
ADD AMOUNT TO WS-BALANCE.
EXEC CICS REWRITE
    DATASET(WS-FILE-NAME)
    FROM(WS-FILE-REC)
    RESP(WS-RESP)
END-EXEC.
```

**React CLI Deposit**:
```typescript
async deposit(accountNumber: string, amount: number): Promise<TransactionResult> {
  // 1. Validate amount
  const validation = validateTransactionAmount(amount);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  // 2. Get current account
  const account = await this.storage.getAccount(accountNumber);
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  // 3. Record balance before
  const balanceBefore = account.balance;
  
  // 4. Update balance
  const newBalance = balanceBefore + amount;
  await this.storage.updateAccount(accountNumber, { balance: newBalance });
  
  // 5. Record transaction (NEW - not in COBOL)
  const transaction = await this.storage.addTransaction({
    accountNumber,
    type: 'deposit',
    amount,
    balanceBefore,
    balanceAfter: newBalance,
    status: 'completed',
  });
  
  return {
    success: true,
    newBalance,
    transaction,
  };
}
```

**New Features**:
- **Transaction History**: Records every transaction
- **Balance Snapshots**: Before/after balances stored
- **Validation**: Comprehensive amount checks
- **Audit Trail**: Complete transaction log

### Withdrawal Logic

**Key Difference**: React CLI allows overdrafts (matching COBOL)

```typescript
// React CLI explicitly maintains COBOL behavior
async withdraw(accountNumber: string, amount: number): Promise<TransactionResult> {
  // ... validation ...
  
  // Allow overdraft (COBOL parity)
  const newBalance = balanceBefore - amount;
  // No check for newBalance < 0
  
  await this.storage.updateAccount(accountNumber, { balance: newBalance });
  // ... record transaction ...
}
```

**Rationale**: Maintain functional parity with original system.

## Security Improvements

### PIN Security

| Aspect | COBOL | React CLI | Improvement |
|--------|-------|-----------|-------------|
| **Storage** | Plain text (zero-padded) | bcrypt hash with salt | ✅ Cannot reverse to original |
| **Transmission** | Clear text | Masked input | ✅ Visual security |
| **Comparison** | String equality | bcrypt.compare() | ✅ Timing attack resistant |
| **Brute Force** | Easy to crack | Computationally expensive | ✅ 10 rounds of hashing |

### Input Validation

**COBOL**: Minimal validation
```cobol
IF WS-ACC-INPUT IS NUMERIC
   AND LENGTH OF WS-ACC-INPUT = 10
THEN
   CONTINUE
ELSE
   ERROR
END-IF.
```

**React CLI**: Multi-layer validation
```typescript
// Layer 1: UI Input Filtering
const sanitized = input.replace(/\D/g, ''); // Only digits

// Layer 2: Component Validation
if (sanitized.length !== 10) {
  return setError('Account number must be 10 digits');
}

// Layer 3: Service Validation
if (!isValidAccountNumber(accountNumber)) {
  return { success: false, error: 'Invalid account number' };
}

// Layer 4: Schema Validation
const validated = AccountSchema.parse({ accountNumber, ... });
```

### Session Security

| Feature | COBOL | React CLI |
|---------|-------|-----------|
| **Session Storage** | CICS COMMAREA (in memory) | SessionManager (in memory) |
| **Timeout** | CICS handles | Not implemented |
| **Concurrent Sessions** | One per terminal | One per instance |
| **Session Hijacking** | CICS protected | Single-user app |

**Note**: Both are single-user applications. Multi-user support would require additional security measures.

## Migration Benefits

### Development Benefits

1. **Type Safety**: TypeScript catches errors at compile time
2. **Testing**: Automated tests vs manual mainframe testing
3. **Debugging**: Modern tools vs CICS dumps
4. **Refactoring**: Easy to change vs rigid COBOL
5. **Version Control**: Git vs mainframe source control
6. **CI/CD**: Automated builds vs JCL jobs
7. **Documentation**: Inline docs vs separate manuals

### Operational Benefits

1. **Portability**: Runs on any OS with Node.js
2. **Scalability**: Easy to containerize and scale
3. **Monitoring**: Modern APM tools available
4. **Logging**: Structured logging vs CICS logs
5. **Backup**: Simple file copy vs VSAM backup
6. **Disaster Recovery**: Standard cloud practices

### User Benefits

1. **Better UX**: Modern UI with colors and formatting
2. **Faster**: No mainframe latency
3. **Accessibility**: Any terminal, not just 3270
4. **Features**: Transaction history, better error messages
5. **Security**: Hashed PINs, better validation

### Cost Benefits

1. **No Mainframe**: Eliminate mainframe costs
2. **No CICS License**: No transaction monitor fees
3. **Open Source**: Free tools and libraries
4. **Cloud Ready**: Deploy to AWS/Azure/GCP
5. **Developer Pool**: More TypeScript devs than COBOL

## Challenges and Trade-offs

### Challenges Encountered

1. **COBOL Behavior**: Understanding zero-padded PINs took time
2. **State Machine**: Mapping numeric states to named enums
3. **Overdrafts**: Deciding to maintain COBOL behavior
4. **Data Format**: Cents vs dollars conversion
5. **Testing**: Matching COBOL behavior exactly

### Trade-offs Made

| Decision | Reason | Impact |
|----------|--------|--------|
| **Allow Overdrafts** | COBOL parity | Less safe, but consistent |
| **JSON Storage** | Simplicity for MVP | Not scalable, but works |
| **No Session Timeout** | COBOL doesn't have it | Less secure, but consistent |
| **In-Memory Sessions** | Simplicity | Lost on restart, acceptable for CLI |
| **Unlimited Login Attempts** | COBOL parity | Security risk, should change |

### Future Improvements

1. **Database**: Migrate from JSON to PostgreSQL
2. **Session Timeout**: Add inactivity timeout
3. **Account Lockout**: Limit failed login attempts
4. **Audit Logging**: Comprehensive audit trail
5. **Multi-User**: Support concurrent users
6. **API Layer**: RESTful API for web/mobile
7. **Encryption**: Encrypt data at rest
8. **2FA**: Two-factor authentication

## Conclusion

The migration from COBOL to React CLI successfully modernized the banking application while maintaining functional parity. The new system is:

- ✅ **More Secure**: Hashed PINs, better validation
- ✅ **More Maintainable**: TypeScript, tests, documentation
- ✅ **More Testable**: Automated test suite
- ✅ **More Extensible**: Easy to add features
- ✅ **More Portable**: Runs anywhere Node.js runs
- ✅ **Better UX**: Modern terminal UI

While maintaining:
- ✅ **Functional Parity**: Same business logic
- ✅ **COBOL Behavior**: Overdrafts, unlimited attempts
- ✅ **Data Compatibility**: Can read COBOL formats

This migration demonstrates how legacy mainframe applications can be modernized while preserving critical business logic and behavior.

---

**For Implementation Details**: See [ARCHITECTURE.md](./ARCHITECTURE.md)  
**For Usage Instructions**: See [USAGE.md](./USAGE.md)  
**For Development Guide**: See [DEVELOPMENT.md](./DEVELOPMENT.md)
