# Task 07: Build Home/Transaction Screen

## Objective
Create the React Ink home screen component that replicates the COBOL ZHOME BMS map, allowing users to view balance and perform transactions.

## Background
The COBOL ZHOME screen provides:
- Current account balance display
- Amount input field for transactions
- Action selector (D=Deposit, W=Withdraw, T=Transfer, Q=Quit)
- Transaction confirmation and error messages

## Requirements

### Component Specification
```typescript
interface HomeScreenProps {
  account: Account;
  onLogout: () => void;
  onTransactionComplete: (transaction: Transaction) => void;
}
```

### UI Elements
1. **Header**: zBANK branding and welcome message
2. **Balance Display**: Current account balance formatted as currency
3. **Transaction Input**: Amount entry field
4. **Action Menu**: Select transaction type
5. **Confirmation**: Show transaction result
6. **Transaction History**: Recent transactions (optional)

## Deliverables

1. **HomeScreen Component**
   ```typescript
   // src/components/screens/HomeScreen.tsx
   import React, { useState } from 'react';
   import { Box, Text } from 'ink';
   import TextInput from 'ink-text-input';
   import SelectInput from 'ink-select-input';
   
   type TransactionAction = 'deposit' | 'withdraw' | 'transfer' | 'history' | 'logout';
   
   export const HomeScreen: React.FC<HomeScreenProps> = ({
     account,
     onLogout,
     onTransactionComplete
   }) => {
     const [amount, setAmount] = useState('');
     const [selectedAction, setSelectedAction] = useState<TransactionAction | null>(null);
     const [message, setMessage] = useState('');
     const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
     const [isProcessing, setIsProcessing] = useState(false);
     
     const actions = [
       { label: 'Deposit', value: 'deposit' },
       { label: 'Withdraw', value: 'withdraw' },
       { label: 'Logout', value: 'logout' },
     ];
     
     const handleActionSelect = (item: { value: TransactionAction }) => {
       if (item.value === 'logout') {
         onLogout();
         return;
       }
       
       setSelectedAction(item.value);
       setMessage('');
     };
     
     const handleTransactionSubmit = async () => {
       if (!amount || !selectedAction) return;
       
       setIsProcessing(true);
       setMessage('');
       
       // Parse as integer cents to avoid floating-point rounding errors
       const amountInCents = Math.round(parseFloat(amount) * 100);
       
       try {
         let result: TransactionResult;
         
         switch (selectedAction) {
           case 'deposit':
             result = await transactionService.deposit(account.accountNumber, amountInCents);
             break;
           case 'withdraw':
             result = await transactionService.withdraw(account.accountNumber, amountInCents);
             break;
           case 'transfer':
             // Transfer not implemented in original COBOL - skip for now
             setMessage('Transfer functionality not yet implemented');
             setIsProcessing(false);
             return;
           default:
             return;
         }
         
         if (result.success) {
           setMessageType('success');
           setMessage(`Transaction successful! New balance: ${formatCurrency(result.newBalance!)}`);
           setAmount('');
           onTransactionComplete(result.transaction!);
         } else {
           setMessageType('error');
           setMessage(result.error || 'Transaction failed');
         }
       } catch (error) {
         setMessageType('error');
         setMessage('An error occurred during transaction');
       } finally {
         setIsProcessing(false);
       }
     };
     
     return (
       <Box flexDirection="column" padding={1}>
         <Header title="zBANK HOME" />
         
         <Box flexDirection="column" marginTop={1}>
           <Text>Welcome, Account: {account.accountNumber}</Text>
           <Text bold color="green">
             Current Balance: {formatCurrency(account.balance)}
           </Text>
         </Box>
         
         {!selectedAction ? (
           <Box flexDirection="column" marginTop={2}>
             <Text>Select an action:</Text>
             <SelectInput items={actions} onSelect={handleActionSelect} />
           </Box>
         ) : (
           <Box flexDirection="column" marginTop={2}>
             <Text>
               {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)}
             </Text>
             
             <Box marginTop={1}>
               <Text>Enter amount ($): </Text>
               <TextInput
                 value={amount}
                 onChange={setAmount}
                 onSubmit={handleTransactionSubmit}
                 placeholder="0.00"
               />
             </Box>
             
             <Box marginTop={1}>
               <Text color="gray">Press Enter to confirm, ESC to cancel</Text>
             </Box>
           </Box>
         )}
         
         {message && (
           <Box marginTop={1}>
             <Text color={messageType === 'success' ? 'green' : messageType === 'error' ? 'red' : 'white'}>
               {messageType === 'success' && '✓ '}
               {messageType === 'error' && '✗ '}
               {message}
             </Text>
           </Box>
         )}
         
         {isProcessing && (
           <Box marginTop={1}>
             <Spinner type="dots" />
             <Text> Processing transaction...</Text>
           </Box>
         )}
         
         <Footer
           actions={[
             { key: 'ESC', label: 'Back to menu', handler: () => setSelectedAction(null) },
             { key: 'Q', label: 'Logout', handler: onLogout },
           ]}
         />
       </Box>
     );
   };
   ```

2. **Currency Input Component**
   ```typescript
   // src/components/common/CurrencyInput.tsx
   export const CurrencyInput: React.FC<CurrencyInputProps> = ({
     value,
     onChange,
     onSubmit
   }) => {
     const handleChange = (input: string) => {
       // Allow digits and single decimal point
       const valid = /^\d*\.?\d{0,2}$/.test(input);
       if (valid) {
         onChange(input);
       }
     };
     
     return (
       <Box>
         <Text>$ </Text>
         <TextInput
           value={value}
           onChange={handleChange}
           onSubmit={onSubmit}
           placeholder="0.00"
         />
       </Box>
     );
   };
   ```

3. **Balance Display Component**
   ```typescript
   // src/components/common/BalanceDisplay.tsx
   export const BalanceDisplay: React.FC<{ balance: number }> = ({ balance }) => {
     const formatted = formatCurrency(balance);
     const color = balance >= 0 ? 'green' : 'red';
     
     return (
       <Box flexDirection="column" padding={1} borderStyle="round">
         <Text dimColor>Current Balance</Text>
         <Text bold color={color} fontSize={20}>
           {formatted}
         </Text>
       </Box>
     );
   };
   ```

4. **Transaction Confirmation Component**
   ```typescript
   // src/components/common/TransactionConfirmation.tsx
   export const TransactionConfirmation: React.FC<ConfirmationProps> = ({
     type,
     amount,
     currentBalance,
     onConfirm,
     onCancel
   }) => {
     const newBalance = type === 'deposit' 
       ? currentBalance + amount 
       : currentBalance - amount;
     
     return (
       <Box flexDirection="column" borderStyle="single" padding={1}>
         <Text bold>Confirm Transaction</Text>
         
         <Box marginTop={1}>
           <Text>Type: {type.toUpperCase()}</Text>
         </Box>
         
         <Box marginTop={1}>
           <Text>Amount: {formatCurrency(amount)}</Text>
         </Box>
         
         <Box marginTop={1}>
           <Text>Current Balance: {formatCurrency(currentBalance)}</Text>
         </Box>
         
         <Box marginTop={1}>
           <Text bold>New Balance: {formatCurrency(newBalance)}</Text>
         </Box>
         
         <Box marginTop={2}>
           <Text color="gray">[Y] Confirm  [N] Cancel</Text>
         </Box>
       </Box>
     );
   };
   ```

## Acceptance Criteria

- [x] Home screen displays account number and balance
- [x] Balance formatted correctly as currency ($XXX.XX)
- [x] Action menu shows deposit and withdraw options (matching COBOL)
- [x] Amount input accepts currency format (XX.XX)
- [x] Deposit transactions update balance immediately
- [x] Withdraw transactions apply even if balance becomes negative (no sufficient-funds validation, matching COBOL behavior)
- [x] Success messages show in green
- [x] Error messages show in red
- [x] Loading indicator shows during processing
- [x] Logout returns to login screen
- [x] ESC key cancels current action
- [x] Balance reflects latest transaction

## Implementation Steps

1. Install additional dependencies:
   ```bash
   npm install ink-select-input
   ```

2. Create `src/components/common/BalanceDisplay.tsx`

3. Create `src/components/common/CurrencyInput.tsx`

4. Create `src/components/common/TransactionConfirmation.tsx`

5. Implement `src/components/screens/HomeScreen.tsx`

6. Wire up transaction service integration

7. Add keyboard handling for actions

8. Implement confirmation flow

9. Add real-time balance updates

10. Write component tests

## Testing

### Component Tests
```typescript
describe('HomeScreen', () => {
  let mockAccount: Account;
  let mockTransactionService: jest.Mocked<TransactionService>;
  
  beforeEach(() => {
    mockAccount = {
      accountNumber: '0000012345',
      balance: 10000,  // $100.00
      // ... other fields
    };
  });
  
  it('should display current balance', () => {
    const { lastFrame } = render(
      <HomeScreen account={mockAccount} onLogout={jest.fn()} />
    );
    
    expect(lastFrame()).toContain('$100.00');
  });
  
  it('should process deposit successfully', async () => {
    mockTransactionService.deposit.mockResolvedValue({
      success: true,
      newBalance: 15000,
      transaction: {} as Transaction
    });
    
    const { stdin, lastFrame } = render(<HomeScreen {...props} />);
    
    // Select deposit
    stdin.write('\r');  // Select first option (Deposit)
    
    // Enter amount
    stdin.write('50.00');
    stdin.write('\r');  // Submit
    
    await waitFor(() => {
      expect(lastFrame()).toContain('Transaction successful');
      expect(lastFrame()).toContain('$150.00');
    });
  });
  
  it('should show error for insufficient funds', async () => {
    mockTransactionService.withdraw.mockResolvedValue({
      success: false,
      error: 'Insufficient funds'
    });
    
    const { stdin, lastFrame } = render(<HomeScreen {...props} />);
    
    // Navigate to withdraw and try to withdraw more than balance
    stdin.write('\x1B[B');  // Down arrow
    stdin.write('\r');      // Select Withdraw
    stdin.write('200.00');  // More than $100 balance
    stdin.write('\r');
    
    await waitFor(() => {
      expect(lastFrame()).toContain('Insufficient funds');
    });
  });
});
```

## UI Layout

### Home Screen Mockup
```
┌─────────────────────────────────────────────────────────────┐
│                        zBANK HOME                            │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
│                                                              │
│  Welcome, Account: 0000012345                               │
│  Current Balance: $100.00                                   │
│                                                              │
│  Select an action:                                          │
│  > Deposit                                                  │
│    Withdraw                                                 │
│    Transfer                                                 │
│    Transaction History                                      │
│    Logout                                                   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [↑↓] Navigate  [↵] Select  [Q] Logout                      │
└─────────────────────────────────────────────────────────────┘
```

### Transaction Input Screen
```
┌─────────────────────────────────────────────────────────────┐
│                        zBANK HOME                            │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
│                                                              │
│  Welcome, Account: 0000012345                               │
│  Current Balance: $100.00                                   │
│                                                              │
│  Deposit                                                    │
│  Enter amount ($): 50.00                                    │
│                                                              │
│  Press Enter to confirm, ESC to cancel                      │
│                                                              │
│  ✓ Transaction successful! New balance: $150.00            │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [ESC] Back to menu  [Q] Logout                             │
└─────────────────────────────────────────────────────────────┘
```

## COBOL BMS Map Comparison

### COBOL ZHOME Map (Excerpt)
```cobol
ZHOME    DFHMDI SIZE=(24,80),LINE=1,COLUMN=1
         DFHMDF POS=(3,30),LENGTH=10,INITIAL='ZBANK HOME'
BALANCE  DFHMDF POS=(10,30),LENGTH=10,ATTRB=(ASKIP,NUM)
AMOUNT   DFHMDF POS=(12,30),LENGTH=10,ATTRB=(UNPROT,NUM)
HOMACT   DFHMDF POS=(14,30),LENGTH=1,ATTRB=UNPROT
         DFHMDF POS=(22,20),LENGTH=40,
         INITIAL='D=DEPOSIT, W=WITHDRAW, T=TRANSFER, Q=QUIT'
```

### Modern React Ink Improvements
1. **Interactive Menu**: SelectInput with arrow key navigation vs single character
2. **Real-time Validation**: Immediate feedback on input
3. **Confirmation Step**: Optional confirmation before transaction
4. **Rich Formatting**: Color-coded messages and formatted currency
5. **Loading States**: Visual feedback during async operations

## Transaction Flow

### Deposit Flow
```
1. User on Home Screen with action menu
2. User selects "Deposit"
3. Screen shows amount input field
4. User enters amount (e.g., "50.00")
5. User presses Enter
6. Loading indicator shows "Processing transaction..."
7. Transaction service processes deposit
8. Success message shows with new balance
9. Balance display updates
10. Input field clears
11. User returned to action menu
```

### Withdrawal Flow
```
1. User selects "Withdraw"
2. User enters amount
3. System validates sufficient funds
   - If insufficient: Show error, remain on input
   - If sufficient: Process transaction
4. Success message with new balance
5. Return to action menu
```

## Related Tasks
- Task 04: Create CLI Menu Navigation
- Task 05: Implement Transaction Processing
- Task 06: Build Login Screen Component
- Task 10: Final Integration and Polish

## References
- COBOL ZHOME map: `docs/overview.md` (lines 147-156)
- Home state machine: `docs/overview.md` (lines 110-117)
- Transaction processing: `docs/overview.md` (lines 354-399)
- [Ink Select Input](https://github.com/vadimdemedes/ink-select-input)
