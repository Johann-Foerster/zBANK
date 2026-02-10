# Data Models and Storage Layer

This directory contains the TypeScript data models and storage layer implementation for zBANK CLI, replacing the COBOL VSAM file system with a modern JSON-based approach.

## Overview

The data models provide type-safe interfaces for accounts and transactions, while the storage layer handles persistence, validation, and concurrent access control.

## Data Models

### Account (`src/models/Account.ts`)

Represents a bank account with the following properties:

- **accountNumber**: 10-digit account identifier (string)
- **pin**: Hashed PIN using bcrypt (never stored in plain text)
- **balance**: Balance in cents (integer to avoid floating point issues)
- **createdAt**: Account creation timestamp
- **updatedAt**: Last modification timestamp

Key design decisions:
- Balance stored in cents to avoid floating point precision issues
- Negative balances allowed (overdrafts) to match COBOL behavior
- PINs are hashed with bcrypt for security (salt rounds: 10)
- Validation enforced with Zod schemas

### Transaction (`src/models/Transaction.ts`)

Represents a banking transaction with audit trail:

- **id**: Unique UUID identifier
- **accountNumber**: Associated account (10 digits)
- **type**: Transaction type (deposit, withdrawal, transfer)
- **amount**: Amount in cents (always positive)
- **balanceBefore**: Balance snapshot before transaction
- **balanceAfter**: Balance snapshot after transaction
- **timestamp**: Transaction timestamp
- **status**: Transaction status (pending, completed, failed)
- **description**: Optional description

Key design decisions:
- UUID for unique transaction IDs
- Amount always positive (type indicates direction)
- Balance snapshots provide audit trail
- Timestamps auto-generated on creation

## Storage Layer

### IStorage Interface (`src/services/IStorage.ts`)

Abstract storage interface that can be implemented by different backends (JSON, SQLite, etc.):

**Account Operations:**
- `getAccount(accountNumber)`: Retrieve account
- `createAccount(account)`: Create new account
- `updateAccount(accountNumber, updates)`: Update existing account
- `deleteAccount(accountNumber)`: Delete account
- `listAccounts()`: List all accounts

**Transaction Operations:**
- `addTransaction(transaction)`: Record new transaction
- `getTransactionHistory(accountNumber, limit?)`: Get transaction history

**Locking Operations:**
- `lockAccount(accountNumber)`: Lock for exclusive access (like VSAM UPDATE)
- `unlockAccount(accountNumber)`: Release lock

### JsonStorage Implementation (`src/services/JsonStorage.ts`)

File-based JSON storage implementation with the following features:

**Atomic Writes:**
- Write-to-temp-then-rename pattern for atomicity
- No partial writes or corrupted data

**Caching:**
- In-memory caching of accounts and transactions
- Cache invalidated on writes
- Improves read performance

**Locking:**
- In-memory lock set (simple implementation)
- Prevents concurrent modifications
- Similar to VSAM record locking

**File Structure:**
- `data/accounts.json`: Map of account number to Account object
- `data/transactions.json`: Array of Transaction objects
- Auto-created on initialization

**Error Handling:**
- Validation with Zod schemas
- Proper error messages with causes
- Cleanup of temp files on failure

## Utilities

### Validation (`src/utils/validation.ts`)

Input validation and formatting utilities:

**Validation Functions:**
- `isValidAccountNumber(accountNumber)`: Check 10-digit format
- `isValidPin(pin)`: Check 4-digit format
- `isValidAmount(amount)`: Check positive integer

**PIN Security:**
- `hashPin(pin)`: Hash PIN with bcrypt
- `comparePin(pin, hash)`: Verify PIN against hash

**Currency Conversion:**
- `dollarsToCents(dollars)`: Convert dollars to cents
- `centsToDollars(cents)`: Convert cents to dollars
- `formatCurrency(cents)`: Format as "$X.XX" string

**Input Sanitization:**
- `sanitizeNumericInput(input)`: Remove non-numeric characters
- `padAccountNumber(accountNumber)`: Pad to 10 digits
- `padPinForCobol(pin)`: Pad to 10 digits (COBOL compatibility)

### Migration (`src/utils/migration.ts`)

Data seeding and migration utilities:

**Seeding:**
- `seedTestAccounts(storage)`: Load COBOL test accounts
  - Account 0000012345, PIN 1111, Balance $100
  - Account 1234567890, PIN 1234, Balance $200

**Display Utilities:**
- `displayAccounts(storage)`: Show all accounts
- `displayTransactionHistory(storage, accountNumber, limit?)`: Show transaction history

## Usage Examples

### Initialize Storage

```typescript
import { JsonStorage } from './services/JsonStorage';

const storage = new JsonStorage('./data');
await storage.initialize();
```

### Create Account

```typescript
import { hashPin } from './utils/validation';

const hashedPin = await hashPin('1234');
const account = await storage.createAccount({
  accountNumber: '1234567890',
  pin: hashedPin,
  balance: 10000, // $100.00
});
```

### Verify PIN

```typescript
import { comparePin } from './utils/validation';

const account = await storage.getAccount('1234567890');
const isValid = await comparePin('1234', account.pin);
```

### Process Transaction

```typescript
import { TransactionType, TransactionStatus } from './models';

// Lock account
await storage.lockAccount(accountNumber);

try {
  // Get current account
  const account = await storage.getAccount(accountNumber);
  
  // Calculate new balance
  const newBalance = account.balance + depositAmount;
  
  // Update account
  await storage.updateAccount(accountNumber, { balance: newBalance });
  
  // Record transaction
  await storage.addTransaction({
    accountNumber,
    type: TransactionType.DEPOSIT,
    amount: depositAmount,
    balanceBefore: account.balance,
    balanceAfter: newBalance,
    status: TransactionStatus.COMPLETED,
  });
} finally {
  // Always unlock
  await storage.unlockAccount(accountNumber);
}
```

### Get Transaction History

```typescript
// Get last 10 transactions
const history = await storage.getTransactionHistory('1234567890', 10);

for (const txn of history) {
  console.log(`${txn.timestamp} | ${txn.type} | ${txn.amount}`);
}
```

## Scripts

### Seed Data (`npm run seed`)

Populates the database with test accounts from COBOL:

```bash
npm run seed
```

Creates:
- Account 0000012345 with PIN 1111 and $100 balance
- Account 1234567890 with PIN 1234 and $200 balance

### Demo Script

Demonstrates storage functionality:

```bash
npx tsx src/scripts/demo.ts
```

Shows:
- Account retrieval
- PIN verification
- Transaction processing
- Transaction history

## Testing

Comprehensive test suite with 82 tests:

```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

**Test Coverage:**
- `tests/models/Account.test.ts`: 12 tests for Account model validation
- `tests/models/Transaction.test.ts`: 14 tests for Transaction model validation
- `tests/services/JsonStorage.test.ts`: 39 tests for storage operations
- `tests/utils/validation.test.ts`: 34 tests for validation utilities

**All tests include:**
- Happy path scenarios
- Error conditions
- Edge cases (negative balances, concurrent access, etc.)
- Data persistence verification

## Migration from COBOL

The storage layer replaces COBOL VSAM with modern equivalents:

| COBOL VSAM | TypeScript Equivalent |
|------------|----------------------|
| KSDS (Key-Sequenced Data Set) | Map keyed by account number |
| Fixed 30-byte records | Flexible JSON objects |
| Record locking (UPDATE) | `lockAccount()` / `unlockAccount()` |
| Sequential file access | Array of transactions |
| Plain text PINs | Bcrypt-hashed PINs |
| Dollar amounts | Cent amounts (integer) |

## Security Improvements

Compared to the COBOL implementation:

1. **PIN Hashing**: PINs stored as bcrypt hashes, never plain text
2. **Data Validation**: Zod schemas validate all input
3. **Type Safety**: TypeScript prevents type errors
4. **Audit Trail**: Transaction history with before/after snapshots
5. **Timestamps**: Automatic creation and update timestamps

## Future Enhancements

Potential improvements for production use:

1. **SQLite Backend**: Replace JSON with SQLite database
2. **File Locking**: Use proper file locks (flock, lockfile)
3. **Encryption**: Encrypt data at rest
4. **Backup**: Automatic backup and recovery
5. **Migration**: Version migration system
6. **Indexes**: Fast lookups by various fields
7. **Transactions**: ACID transactions for consistency

## References

- Task Definition: `tasks/02_design_data_models.md`
- COBOL Structure: `docs/overview.md`
- Zod Documentation: https://github.com/colinhacks/zod
- Bcrypt Documentation: https://www.npmjs.com/package/bcrypt
