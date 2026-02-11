# HomeScreen Implementation - Visual Guide

## Screen Flow

### 1️⃣ Login to Home Transition
After successful login, user is automatically navigated to the HomeScreen.

### 2️⃣ HomeScreen - Action Menu
```
╔══════════════╗
║    zBANK     ║
╚══════════════╝

HOME
────────────────────────────────────────────────────────

Welcome, Account: 0000012345
Current Balance:
$100.00

Select an action:
> Deposit
  Withdraw
  Logout

────────────────────────────────────────────────────────
[↑↓] Navigate  [↵] Select  [Q] Logout
```

**Features:**
- Account number displayed
- Balance shown with color coding (green positive, red negative)
- Interactive menu with arrow key navigation
- Keyboard shortcuts visible in footer

### 3️⃣ Transaction Input
```
╔══════════════╗
║    zBANK     ║
╚══════════════╝

HOME
────────────────────────────────────────────────────────

Welcome, Account: 0000012345
Current Balance:
$100.00

Deposit
Enter amount:
$ 50.00█

Press Enter to confirm, ESC to cancel

────────────────────────────────────────────────────────
[ESC] Cancel  [Q] Logout
```

**Features:**
- Selected action displayed
- Currency input with $ prefix
- Real-time validation (XX.XX format)
- ESC key to cancel

### 4️⃣ Processing State
```
╔══════════════╗
║    zBANK     ║
╚══════════════╝

HOME
────────────────────────────────────────────────────────

Welcome, Account: 0000012345
Current Balance:
$100.00

Deposit
Enter amount:
$ 50.00

Press Enter to confirm, ESC to cancel

⠋ Processing transaction...

────────────────────────────────────────────────────────
[ESC] Cancel  [Q] Logout
```

**Features:**
- Loading spinner animation
- Processing message in yellow
- Input disabled during processing

### 5️⃣ Success State
```
╔══════════════╗
║    zBANK     ║
╚══════════════╝

HOME
────────────────────────────────────────────────────────

Welcome, Account: 0000012345
Current Balance:
$150.00

Select an action:
> Deposit
  Withdraw
  Logout

✓ Transaction successful! New balance: $150.00

────────────────────────────────────────────────────────
[↑↓] Navigate  [↵] Select  [Q] Logout
```

**Features:**
- Balance updated immediately
- Green success message with checkmark
- Automatically returns to action menu
- Input cleared for next transaction

### 6️⃣ Overdraft Example (COBOL Behavior)
```
╔══════════════╗
║    zBANK     ║
╚══════════════╝

HOME
────────────────────────────────────────────────────────

Welcome, Account: 0000012345
Current Balance:
-$50.00

Select an action:
> Deposit
  Withdraw
  Logout

✓ Transaction successful! New balance: -$50.00

────────────────────────────────────────────────────────
[↑↓] Navigate  [↵] Select  [Q] Logout
```

**Features:**
- Red balance for negative amounts
- Overdrafts allowed (matches COBOL)
- No "insufficient funds" error
- Transaction succeeds even with negative result

## Component Architecture

### CurrencyInput Component
```typescript
<CurrencyInput
  value={amount}
  onChange={setAmount}
  onSubmit={handleTransactionSubmit}
  focus={!isProcessing}
/>
```

**Validation:**
- Only accepts digits and single decimal point
- Limits to 2 decimal places (XX.XX)
- Empty string allowed
- Real-time validation

### BalanceDisplay Component
```typescript
<BalanceDisplay balance={account.balance} />
```

**Features:**
- Formats cents to currency ($XXX.XX)
- Green for positive balances
- Red for negative balances (overdrafts)
- Customizable label

### HomeScreen Component
```typescript
<HomeScreen onLogout={() => navigateTo(AppState.EXIT)} />
```

**State Management:**
- Account from SessionManager
- Transaction state (action, amount, messages)
- Loading state for async operations
- Message type for color coding

## Keyboard Controls

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate menu items |
| Enter | Select action / Submit transaction |
| ESC | Cancel current action / Return to menu |
| Q | Quick logout |

## Transaction Flow

1. **Select Action**: Use arrow keys to select Deposit or Withdraw
2. **Enter Amount**: Type currency amount (e.g., 50.00)
3. **Submit**: Press Enter to process
4. **Processing**: Loading indicator appears
5. **Result**: Success message and updated balance
6. **Return**: Automatically back to action menu

## Testing

Run the demo to see all states:
```bash
cd zbank-cli
npx tsx src/scripts/demo-home.ts
```

Run integration tests:
```bash
npx tsx src/scripts/test-home.ts
```

Run unit tests:
```bash
npm test -- CurrencyInput
npm test -- BalanceDisplay
```

## Live Testing

Start the application:
```bash
npm start
```

Test accounts:
- **Account**: 0000012345, **PIN**: 1111, **Balance**: $100.00
- **Account**: 1234567890, **PIN**: 1234, **Balance**: $200.00

## COBOL Comparison

| Feature | COBOL ZHOME | React Ink HomeScreen |
|---------|-------------|---------------------|
| Balance Display | POS=(10,30) | BalanceDisplay component |
| Amount Input | POS=(12,30), NUM | CurrencyInput with validation |
| Action Input | Single char (D/W/T/Q) | SelectInput menu |
| Overdraft | Allowed | Allowed (matching) |
| Transaction Types | D, W, (T not impl) | Deposit, Withdraw |
| Error Messages | Field-based | Color-coded messages |
| Loading State | Synchronous | Async with spinner |

## Color Coding

- **Green** 🟢: Positive balance, success messages
- **Red** 🔴: Negative balance, error messages
- **Yellow** 🟡: Processing/loading state
- **Cyan** 🔵: Headers and labels
- **Gray** ⚫: Dimmed hints and separators

## Future Enhancements

Potential improvements not in current scope:
- Transaction history display
- Transfer functionality (not in COBOL either)
- Transaction confirmation dialog
- Account statement export
- Receipt printing
