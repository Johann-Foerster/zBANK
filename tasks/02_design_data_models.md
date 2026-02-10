# Task 02: Design Data Models and Storage Layer

## Objective
Create TypeScript data models and design a storage layer to replace the VSAM file system used in the COBOL application.

## Background
The COBOL application uses a VSAM KSDS (Key-Sequenced Data Set) with 30-byte fixed records:
- Account Number: 10 bytes (numeric)
- PIN: 10 bytes (numeric, zero-padded)
- Balance: 10 bytes (numeric, whole dollars)

We need to modernize this to use JSON-based storage with proper data types and validation.

## Requirements

### Data Models

#### Account Model
```typescript
interface Account {
  accountNumber: string;      // 10-digit account number
  pin: string;                // Hashed PIN (not plain text for security)
  balance: number;            // Balance in cents (avoid floating point)
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last modification timestamp
}
```

**Note**: We only add hashing for PINs (critical security). Fields like `isLocked` and `failedLoginAttempts` are NOT included to stay true to COBOL.

#### Transaction Model
```typescript
interface Transaction {
  id: string;                // Unique transaction ID
  accountNumber: string;     // Associated account
  type: 'deposit' | 'withdrawal' | 'transfer';
  amount: number;            // Amount in cents
  balanceBefore: number;     // Balance before transaction
  balanceAfter: number;      // Balance after transaction
  timestamp: Date;           // Transaction timestamp
  status: 'pending' | 'completed' | 'failed';
  description?: string;      // Optional description
}
```

### Storage Layer

#### Storage Interface
```typescript
interface IStorage {
  // Account operations
  getAccount(accountNumber: string): Promise<Account | null>;
  createAccount(account: Omit<Account, 'createdAt' | 'updatedAt'>): Promise<Account>;
  updateAccount(accountNumber: string, updates: Partial<Account>): Promise<Account>;
  deleteAccount(accountNumber: string): Promise<boolean>;
  listAccounts(): Promise<Account[]>;
  
  // Transaction operations
  addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction>;
  getTransactionHistory(accountNumber: string, limit?: number): Promise<Transaction[]>;
  
  // Lock/unlock for concurrent access (similar to VSAM UPDATE lock)
  lockAccount(accountNumber: string): Promise<boolean>;
  unlockAccount(accountNumber: string): Promise<boolean>;
}
```

## Deliverables

1. **TypeScript Type Definitions**
   - Create `src/models/Account.ts`
   - Create `src/models/Transaction.ts`
   - Define enums for transaction types and statuses
   - Add validation schemas (using Zod or similar)

2. **Storage Implementation Options**
   - **Option A**: JSON file storage (simple, development-friendly)
   - **Option B**: SQLite database (production-ready, relational)
   - **Option C**: LevelDB/RocksDB (key-value, similar to VSAM)
   
   Recommendation: Start with JSON, migrate to SQLite later

3. **JSON Storage Implementation**
   - Create `src/services/JsonStorage.ts`
   - Implement atomic file operations
   - Handle concurrent access with file locking
   - Support transactions and rollback

4. **Data Migration Utilities**
   - Create `src/utils/migration.ts`
   - Script to convert COBOL test data to JSON format
   - Load initial accounts from SEQDAT.ZBANK.cbl:
     - Account: 0000012345, PIN: 0000001111, Balance: $100
     - Account: 1234567890, PIN: 0000001234, Balance: $200

5. **Validation Layer**
   - Account number format validation (10 digits)
   - PIN format validation (4 digits input, hashed storage)
   - Balance validation (non-negative for withdrawals)
   - Input sanitization

## Acceptance Criteria

- [x] TypeScript interfaces defined for all data models
- [x] Storage interface abstraction created
- [x] At least one storage implementation working (JSON or SQLite)
- [x] Test data loaded successfully
- [x] CRUD operations for accounts functional
- [x] Transaction history recording works
- [x] Validation prevents invalid data
- [x] Unit tests cover all storage operations

## Implementation Steps

1. Define TypeScript interfaces in `src/models/`
2. Choose storage backend (recommend JSON for MVP)
3. Implement storage service with IStorage interface
4. Create seed data file with test accounts
5. Write unit tests for storage operations
6. Implement data validation with Zod schemas
7. Add migration script for COBOL data

## Testing
- Unit tests for each storage method
- Test concurrent access and locking
- Validate data integrity after operations
- Test error handling for edge cases

## Security Considerations
- **Never store PINs in plain text** (hash with bcrypt or argon2)
- Implement account lockout after 3 failed attempts
- Add audit logging for all data modifications
- Encrypt sensitive data at rest (optional for MVP)

## Data Format Example

### accounts.json
```json
{
  "0000012345": {
    "accountNumber": "0000012345",
    "pin": "$2b$10$...",  // bcrypt hash
    "balance": 10000,      // $100.00 in cents
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-02-10T19:30:00Z"
  },
  "1234567890": {
    "accountNumber": "1234567890",
    "pin": "$2b$10$...",
    "balance": 20000,      // $200.00 in cents
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-02-10T19:30:00Z"
  }
}
```

### transactions.json
```json
[
  {
    "id": "txn_001",
    "accountNumber": "0000012345",
    "type": "deposit",
    "amount": 5000,
    "balanceBefore": 10000,
    "balanceAfter": 15000,
    "timestamp": "2026-02-10T19:30:00Z",
    "status": "completed",
    "description": "Cash deposit"
  }
]
```

## Related Tasks
- Task 01: Initialize React CLI Application
- Task 03: Implement Authentication System
- Task 05: Implement Transaction Processing
- Task 09: Testing and Documentation

## References
- VSAM structure: `docs/overview.md` (lines 57-62, 195-210)
- COBOL data structure: `docs/overview.md` (lines 91-97)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Validation](https://github.com/colinhacks/zod)
