# Task 05: Implement Transaction Processing

## Objective
Create the core banking transaction logic for deposits and withdrawals, replicating the COBOL transaction processing behavior.

## Background
The COBOL application supports:
- **Deposit (D)**: Add funds to balance
- **Withdrawal (W)**: Subtract funds from balance
- **Transfer (T)**: Not implemented in COBOL (placeholder only)
- **Quit (Q)**: Exit to login screen

We need to implement deposits and withdrawals matching the COBOL behavior (including allowing negative balances as COBOL does).

## Requirements

### Transaction Service Interface
```typescript
interface ITransactionService {
  deposit(accountNumber: string, amount: number): Promise<TransactionResult>;
  withdraw(accountNumber: string, amount: number): Promise<TransactionResult>;
  transfer(fromAccount: string, toAccount: string, amount: number): Promise<TransactionResult>;
  getBalance(accountNumber: string): Promise<number>;
  validateAmount(amount: number): ValidationResult;
}

interface TransactionResult {
  success: boolean;
  transaction?: Transaction;
  newBalance?: number;
  error?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

## Deliverables

1. **Transaction Service Implementation**
   ```typescript
   // src/services/TransactionService.ts
   export class TransactionService implements ITransactionService {
     constructor(private storage: IStorage) {}
     
     async deposit(accountNumber: string, amount: number): Promise<TransactionResult> {
       // Validate amount
       const validation = this.validateAmount(amount);
       if (!validation.valid) {
         return { success: false, error: validation.error };
       }
       
       // Get current account
       const account = await this.storage.getAccount(accountNumber);
       if (!account) {
         return { success: false, error: 'Account not found' };
       }
       
       // Calculate new balance
       const newBalance = account.balance + amount;
       
       // Create transaction record
       const transaction = await this.storage.addTransaction({
         accountNumber,
         type: 'deposit',
         amount,
         balanceBefore: account.balance,
         balanceAfter: newBalance,
         status: 'completed'
       });
       
       // Update account
       await this.storage.updateAccount(accountNumber, { 
         balance: newBalance,
         updatedAt: new Date()
       });
       
       return { success: true, transaction, newBalance };
     }
     
     async withdraw(accountNumber: string, amount: number): Promise<TransactionResult> {
       // Validate amount
       const validation = this.validateAmount(amount);
       if (!validation.valid) {
         return { success: false, error: validation.error };
       }
       
       // Get current account
       const account = await this.storage.getAccount(accountNumber);
       if (!account) {
         return { success: false, error: 'Account not found' };
       }
       
       // IMPORTANT: COBOL allows negative balances, so we do NOT check sufficient funds
       // This matches the original COBOL behavior (see docs/overview.md line 386)
       
       // Calculate new balance (may go negative like COBOL)
       const newBalance = account.balance - amount;
       
       // Create transaction record
       const transaction = await this.storage.addTransaction({
         accountNumber,
         type: 'withdrawal',
         amount,
         balanceBefore: account.balance,
         balanceAfter: newBalance,
         status: 'completed'
       });
       
       // Update account
       await this.storage.updateAccount(accountNumber, { 
         balance: newBalance,
         updatedAt: new Date()
       });
       
       return { success: true, transaction, newBalance };
     }
     
     async transfer(fromAccount: string, toAccount: string, amount: number): Promise<TransactionResult> {
       // Validate amount
       const validation = this.validateAmount(amount);
       if (!validation.valid) {
         return { success: false, error: validation.error };
       }
       
       // Get both accounts
       const from = await this.storage.getAccount(fromAccount);
       const to = await this.storage.getAccount(toAccount);
       
       if (!from || !to) {
         return { success: false, error: 'Account not found' };
       }
       
       // Check sufficient funds
       if (from.balance < amount) {
         return { success: false, error: 'Insufficient funds' };
       }
       
       // Perform atomic transfer
       const newFromBalance = from.balance - amount;
       const newToBalance = to.balance + amount;
       
       // Record withdrawal from source account
       const withdrawalTxn = await this.storage.addTransaction({
         accountNumber: fromAccount,
         type: 'transfer',
         amount: -amount,  // Negative for outgoing
         balanceBefore: from.balance,
         balanceAfter: newFromBalance,
         status: 'completed',
         description: `Transfer to ${toAccount}`
       });
       
       // Record deposit to destination account
       await this.storage.addTransaction({
         accountNumber: toAccount,
         type: 'transfer',
         amount: amount,  // Positive for incoming
         balanceBefore: to.balance,
         balanceAfter: newToBalance,
         status: 'completed',
         description: `Transfer from ${fromAccount}`
       });
       
       // Update both accounts
       await this.storage.updateAccount(fromAccount, { balance: newFromBalance });
       await this.storage.updateAccount(toAccount, { balance: newToBalance });
       
       return { success: true, transaction: withdrawalTxn, newBalance: newFromBalance };
     }
     
     validateAmount(amount: number): ValidationResult {
       if (amount <= 0) {
         return { valid: false, error: 'Amount must be greater than zero' };
       }
       if (!Number.isInteger(amount)) {
         return { valid: false, error: 'Amount must be in cents (whole number)' };
       }
       if (amount > 1000000000) {  // $10 million limit
         return { valid: false, error: 'Amount exceeds maximum limit' };
       }
       return { valid: true };
     }
   }
   ```

2. **Transaction Validation Utilities**
   ```typescript
   // src/utils/validation.ts
   export function validateTransactionAmount(amount: number): boolean;
   export function formatCurrency(cents: number): string;
   export function parseCurrency(input: string): number | null;
   ```

3. **Transaction Formatter**
   ```typescript
   // src/utils/formatter.ts
   export function formatTransaction(transaction: Transaction): string;
   export function formatBalance(balance: number): string;
   export function formatTimestamp(date: Date): string;
   ```

4. **Transaction History Service**
   ```typescript
   // src/services/TransactionHistoryService.ts
   export class TransactionHistoryService {
     async getHistory(accountNumber: string, limit?: number): Promise<Transaction[]>;
     async getRecentTransactions(accountNumber: string, days: number): Promise<Transaction[]>;
     async exportHistory(accountNumber: string, format: 'json' | 'csv'): Promise<string>;
   }
   ```

## Acceptance Criteria

- [x] Deposit transactions update balance correctly
- [x] Withdrawal transactions work like COBOL (allow negative balances)
- [x] Transfer is placeholder only (matching COBOL)
- [x] Transaction records stored with basic info
- [x] Amount validation prevents invalid inputs
- [x] Currency formatting handles cents properly
- [x] Unit tests cover deposit and withdrawal
- [x] Edge cases handled (zero amount, overflow, etc.)

## Implementation Steps

1. Create `src/services/TransactionService.ts`

2. Implement deposit functionality:
   - Validate amount
   - Update balance
   - Record transaction

3. Implement withdrawal functionality:
   - Validate amount
   - Check sufficient funds
   - Update balance
   - Record transaction

4. Implement transfer functionality:
   - Validate both accounts exist
   - Check sufficient funds
   - Perform atomic update
   - Record both transactions

5. Create validation utilities in `src/utils/validation.ts`

6. Create formatting utilities in `src/utils/formatter.ts`

7. Write comprehensive unit tests

8. Add integration tests with storage layer

## Testing

### Unit Tests
```typescript
describe('TransactionService', () => {
  let service: TransactionService;
  let mockStorage: jest.Mocked<IStorage>;
  
  beforeEach(() => {
    mockStorage = createMockStorage();
    service = new TransactionService(mockStorage);
  });
  
  describe('deposit', () => {
    it('should add amount to balance', async () => {
      mockStorage.getAccount.mockResolvedValue({
        accountNumber: '0000012345',
        balance: 10000,  // $100.00
        // ... other fields
      });
      
      const result = await service.deposit('0000012345', 5000);  // $50.00
      
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(15000);  // $150.00
      expect(mockStorage.updateAccount).toHaveBeenCalledWith(
        '0000012345',
        expect.objectContaining({ balance: 15000 })
      );
    });
    
    it('should reject negative amounts', async () => {
      const result = await service.deposit('0000012345', -1000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('greater than zero');
    });
  });
  
  describe('withdraw', () => {
    it('should subtract amount from balance', async () => {
      mockStorage.getAccount.mockResolvedValue({
        accountNumber: '0000012345',
        balance: 10000,  // $100.00
        // ... other fields
      });
      
      const result = await service.withdraw('0000012345', 3000);  // $30.00
      
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(7000);  // $70.00
    });
    
    it('should reject withdrawal exceeding balance', async () => {
      mockStorage.getAccount.mockResolvedValue({
        accountNumber: '0000012345',
        balance: 10000,  // $100.00
        // ... other fields
      });
      
      const result = await service.withdraw('0000012345', 15000);  // $150.00
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient funds');
    });
  });
  
  describe('transfer', () => {
    it('should transfer funds between accounts', async () => {
      mockStorage.getAccount
        .mockResolvedValueOnce({  // From account
          accountNumber: '0000012345',
          balance: 10000,
        })
        .mockResolvedValueOnce({  // To account
          accountNumber: '1234567890',
          balance: 20000,
        });
      
      const result = await service.transfer('0000012345', '1234567890', 5000);
      
      expect(result.success).toBe(true);
      expect(mockStorage.updateAccount).toHaveBeenCalledTimes(2);
    });
  });
});
```

## COBOL vs Modern Implementation

### COBOL Transaction Processing
```cobol
* Deposit (State 1, Action 'D')
IF ACTION-INPUT = 'D' THEN
  ADD AMOUNT-INPUT TO WS-BALANCE
  EXEC CICS REWRITE
    DATASET(WS-FILE-NAME)
    FROM(WS-FILE-REC)
    RESP(WS-RESP-CODE)
  END-EXEC
END-IF

* Withdrawal (State 1, Action 'W')
IF ACTION-INPUT = 'W' THEN
  SUBTRACT AMOUNT-INPUT FROM WS-BALANCE
  EXEC CICS REWRITE
    DATASET(WS-FILE-NAME)
    FROM(WS-FILE-REC)
    RESP(WS-RESP-CODE)
  END-EXEC
END-IF
```

**COBOL Behavior:**
- No validation for negative balance (allows overdraft)
- No transaction history
- No error handling for insufficient funds
- Direct VSAM updates without rollback capability

### Modern Implementation Approach
1. **Match COBOL Behavior**: Allow negative balances on withdrawal
2. **Basic Logging**: Optional transaction records for debugging
3. **Simple Validation**: Check amount is positive and valid
4. **Direct Updates**: Match COBOL's direct update approach

## Currency Handling

### COBOL: Whole Dollars
```cobol
WS-BALANCE  PIC 9(10).   * Stores 100 for $100
```

### Modern: Cents (Avoid Floating Point)
```typescript
// Store amounts in cents to avoid floating point issues
const balance = 10000;  // $100.00
const deposit = 5000;   // $50.00
const newBalance = balance + deposit;  // 15000 = $150.00

// Format for display
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

formatCurrency(15000);  // "$150.00"
```

## Related Tasks
- Task 02: Design Data Models and Storage Layer
- Task 03: Implement Authentication System
- Task 07: Build Home/Transaction Screen
- Task 10: Add Transaction History View

## References
- COBOL transactions: `docs/overview.md` (lines 354-399)
- Transaction types: `docs/overview.md` (lines 110-117)
- [Stripe Currency Best Practices](https://stripe.com/docs/currencies)
