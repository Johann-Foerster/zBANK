# zBANK CLI - Usage Guide

This guide provides detailed instructions on how to use the zBANK CLI banking application.

## Table of Contents

- [Quick Start](#quick-start)
- [Login](#login)
- [Home Screen Operations](#home-screen-operations)
- [Account Registration](#account-registration)
- [Common Workflows](#common-workflows)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Starting the Application

```bash
# Method 1: Using npm
npm start

# Method 2: Direct execution
node dist/index.js

# Method 3: Global command (after npm link)
zbank
```

### Test Accounts

For testing, use these pre-seeded accounts:

| Account Number | PIN  | Initial Balance |
|---------------|------|-----------------|
| 0000012345    | 1111 | $100.00         |
| 1234567890    | 1234 | $200.00         |

## Login

### Login Process

1. **Start the application** - You'll see the zBANK login screen
2. **Enter Account Number** - Type your 10-digit account number
   - Only digits are accepted
   - Must be exactly 10 digits
3. **Press Tab or Enter** - Move to the PIN field
4. **Enter PIN** - Type your 4-digit PIN
   - PIN is masked with asterisks (****)
   - Only digits are accepted
   - Must be exactly 4 digits
5. **Press Enter** - Submit login credentials

### Example Login Session

```
╔═══════════════════════════════════════════════════════════╗
║                        zBANK LOGIN                        ║
╚═══════════════════════════════════════════════════════════╝

  Account Number: 0000012345
  PIN:            ****

                   [Press ENTER to Login]

  [Q] Quit  [R] Register
```

### Login Errors

Common login errors and solutions:

- **"Account number must be 10 digits"**
  - Enter exactly 10 digits
  - Example: `0000012345` (with leading zeros)

- **"PIN must be 4 digits"**
  - Enter exactly 4 digits
  - Example: `1111`

- **"Invalid PIN"**
  - PIN is incorrect for this account
  - No account lockout - unlimited attempts allowed

- **"Account not found"**
  - Account number doesn't exist in the system
  - Check for typos or register a new account

## Home Screen Operations

After successful login, you'll see the Home screen with your account balance and transaction options.

### Screen Layout

```
╔═══════════════════════════════════════════════════════════╗
║                        zBANK HOME                         ║
╚═══════════════════════════════════════════════════════════╝

  Account: 0000012345
  Balance: $100.00

  Select Transaction:
  > Deposit
    Withdraw
    Quit

  [↑/↓] Navigate  [Enter] Select  [Q] Quit
```

### Making a Deposit

1. **Select "Deposit"** from the menu (use arrow keys)
2. **Press Enter** to confirm
3. **Enter Amount** in dollars and cents
   - Format: `50.00` or `50`
   - Accepts: `$50.00`, `50.00`, `50`
4. **Press Enter** to confirm deposit
5. **View Updated Balance** on the confirmation screen

#### Deposit Example

```
Enter deposit amount: $50.00

Processing deposit...

✓ Deposit Successful!
  Amount: $50.00
  New Balance: $150.00
```

#### Deposit Rules

- Minimum amount: $0.01 (1 cent)
- Maximum amount: $99,999,999.99
- Must be positive
- Decimal places: Up to 2 (cents)

### Making a Withdrawal

1. **Select "Withdraw"** from the menu (use arrow keys)
2. **Press Enter** to confirm
3. **Enter Amount** in dollars and cents
   - Format: `30.00` or `30`
4. **Press Enter** to confirm withdrawal
5. **View Updated Balance** on the confirmation screen

#### Withdrawal Example

```
Enter withdrawal amount: $30.00

Processing withdrawal...

✓ Withdrawal Successful!
  Amount: $30.00
  New Balance: $120.00
```

#### Withdrawal Rules

- Minimum amount: $0.01 (1 cent)
- Maximum amount: $99,999,999.99
- Overdrafts allowed (balance can go negative)
- Decimal places: Up to 2 (cents)

**Note**: Following COBOL application behavior, overdrafts are permitted. Your balance can become negative.

### Quitting (Logout)

1. **Select "Quit"** from the menu or press **Q** key
2. Logs you out and returns to login screen
3. Your session is ended and account is unlocked

## Account Registration

### Registration Process

From the login screen:

1. **Press R** for Register
2. **Account Number** is auto-generated (10 digits)
3. **Enter PIN** (4 digits)
4. **Confirm PIN** (re-enter the same 4 digits)
5. **Enter Initial Deposit** (optional, minimum $0.01)
6. **Review Details** and confirm
7. **Account Created** - you'll be returned to login

### Registration Example

```
╔═══════════════════════════════════════════════════════════╗
║                      ACCOUNT REGISTER                      ║
╚═══════════════════════════════════════════════════════════╝

  Your new account number: 5678901234

  Enter PIN (4 digits): ****
  Confirm PIN: ****

  Initial Deposit: $100.00

  [Y] Confirm  [N] Cancel
```

### Registration Rules

- **PIN Requirements**:
  - Exactly 4 digits
  - Must match on confirmation
  - Will be securely hashed before storage

- **Initial Deposit**:
  - Optional (can be $0.00)
  - If provided, must be positive
  - Format: `100.00` or `100`

- **Account Number**:
  - Automatically generated
  - 10 digits
  - Guaranteed unique

## Common Workflows

### Complete Banking Session

```
1. Start zBANK
2. Login with account number and PIN
3. View current balance
4. Make deposit ($50.00)
5. Make withdrawal ($20.00)
6. Check new balance
7. Quit (logout)
```

### Register and Use New Account

```
1. Start zBANK
2. Press R for Register
3. Enter and confirm PIN
4. Make initial deposit ($100.00)
5. Note your new account number
6. Login with new credentials
7. Perform transactions
```

### Check Balance Only

```
1. Start zBANK
2. Login with credentials
3. View balance on home screen
4. Press Q to quit (no transactions needed)
```

## Keyboard Shortcuts

### Login Screen

| Key | Action |
|-----|--------|
| Tab | Switch between Account and PIN fields |
| Enter | Submit login or move to next field |
| Q | Quit application |
| R | Go to registration screen |
| Esc | Clear current field |

### Home Screen

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate menu options |
| Enter | Select current option |
| Q | Quick logout |
| Esc | Cancel current action |

### Transaction Entry

| Key | Action |
|-----|--------|
| 0-9 | Enter digits |
| . | Decimal point (for currency) |
| Enter | Confirm amount |
| Esc | Cancel transaction |
| Backspace | Delete last character |

## Data Persistence

### Local Storage

- All account data stored in `data/accounts.json`
- Transaction history stored in `data/transactions.json`
- Data persists between sessions
- Located in zbank-cli directory

### Security Notes

- PINs are hashed using bcrypt before storage
- Account numbers are not encrypted (for demo purposes)
- Data stored locally - no network transmission
- For educational use only - not production-ready security

## Troubleshooting

### Application Won't Start

**Problem**: Error when running `npm start`

**Solutions**:
1. Ensure build is complete: `npm run build`
2. Check Node.js version: `node --version` (need v18+)
3. Reinstall dependencies: `rm -rf node_modules && npm install --legacy-peer-deps`

### Data File Errors

**Problem**: "Cannot read/write data files"

**Solutions**:
1. Ensure `data/` directory exists
2. Check file permissions
3. Delete corrupted files and reseed: `npm run seed`

### PIN Not Working

**Problem**: "Invalid PIN" error for correct PIN

**Solutions**:
1. Verify PIN is exactly 4 digits
2. Ensure no spaces or special characters
3. Check if account was created correctly
4. Try test accounts (see Quick Start section)

### Display Issues

**Problem**: Terminal UI looks broken or corrupted

**Solutions**:
1. Resize terminal to at least 80x24 characters
2. Use a modern terminal (iTerm2, Windows Terminal, GNOME Terminal)
3. Ensure terminal supports ANSI colors
4. Try clearing terminal: `clear` or `cls`

### Balance Not Updating

**Problem**: Transactions succeed but balance doesn't change

**Solutions**:
1. Check data files for corruption
2. Restart application
3. Verify transactions are being recorded: check `data/transactions.json`
4. Reseed database: `npm run seed`

## Advanced Usage

### Seeding Test Data

```bash
# Reset database with test accounts
npm run seed
```

This creates:
- Account `0000012345` with PIN `1111` and balance $100.00
- Account `1234567890` with PIN `1234` and balance $200.00

### Development Mode

```bash
# Run with hot reload
npm run dev

# In another terminal, run the app
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode (auto-rerun on changes)
npm run test:watch
```

## Tips and Best Practices

### For Users

1. **Keep track of your account number** - Write it down when registering
2. **Choose memorable PINs** - But not too obvious (avoid 1234, 0000)
3. **Check balance regularly** - Verify transactions completed correctly
4. **Use realistic amounts** - Practice good banking habits
5. **Quit properly** - Always use Q to logout, don't force-close

### For Testing

1. **Use test accounts first** - Before creating new accounts
2. **Test edge cases** - Try overdrafts, large amounts, etc.
3. **Check transaction history** - Verify all operations recorded
4. **Reset database as needed** - Use `npm run seed` to start fresh
5. **Review logs** - Check console for error messages

## Getting Help

### Documentation

- **README.md** - Installation and quick start
- **DEVELOPMENT.md** - Developer guide and architecture
- **MIGRATION.md** - COBOL to React CLI mapping
- **ARCHITECTURE.md** - Technical architecture details

### Common Questions

**Q: Can I have multiple accounts?**
A: Yes, register as many accounts as needed. Each has unique account number.

**Q: Are transactions permanent?**
A: Yes, all transactions persist in JSON files until database is reset.

**Q: Can I transfer between accounts?**
A: Not yet - transfer feature is in development.

**Q: What happens if I overdraft?**
A: Balance goes negative (matching COBOL behavior). No overdraft fees or limits.

**Q: Is my data secure?**
A: PINs are hashed, but this is for educational purposes only. Not production-grade security.

**Q: Can I export my transaction history?**
A: Check `data/transactions.json` for raw transaction data in JSON format.

## Appendix

### Currency Format

Accepted formats for dollar amounts:
- `100.00` - Standard format
- `100` - Whole dollars (assumed .00)
- `$100.00` - With dollar sign
- `100.5` - Partial cents (rounded to 100.50)

Invalid formats:
- `-50.00` - Negative amounts
- `100.001` - More than 2 decimal places
- `abc` - Non-numeric input
- `1,000.00` - Commas not supported

### Account Number Format

- Length: Exactly 10 digits
- Format: `NNNNNNNNNN` (numbers only)
- Example: `0000012345`, `1234567890`
- Leading zeros: Required for numbers < 10 digits
- No spaces, dashes, or special characters

### PIN Format

- Length: Exactly 4 digits
- Format: `NNNN` (numbers only)
- Example: `1234`, `0000`, `9999`
- No letters or special characters
- Case-sensitive: N/A (numbers only)

---

**Need more help?** Check the documentation files or review the source code in `src/` directory.

*Happy Banking with zBANK!* 🏦
