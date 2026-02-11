# LoginScreen Component - Visual Documentation

## Overview
The LoginScreen component provides user authentication for the zBANK CLI application, replicating the functionality of the COBOL ZLOGIN BMS map with modern React Ink UI.

## UI Layout

### Normal State (Ready for Input)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ____  ____   __   __ _  __ _ 
 (_   \(  _ \ / _\ (  ( \(  / )
  / /\ ) _ (/    \/    / )  ( 
 (____/(____/\_/\_/\_)__)(__\_)
                        LOGIN
────────────────────────────────────────────────────────────

  Account Number (10 digits):
  0000012345

  PIN (4 digits):
  ****

  Press Enter to login, Tab to switch fields

────────────────────────────────────────────────────────────
  [Q] Quit  [R] Register  [↵] Login
```

### Loading State (During Authentication)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ____  ____   __   __ _  __ _ 
 (_   \(  _ \ / _\ (  ( \(  / )
  / /\ ) _ (/    \/    / )  ( 
 (____/(____/\_/\_/\_)__)(__\_)
                        LOGIN
────────────────────────────────────────────────────────────

  Account Number (10 digits):
  0000012345

  PIN (4 digits):
  ****

  ⠋ Authenticating...

────────────────────────────────────────────────────────────
  [Q] Quit  [R] Register  [↵] Login
```

### Error State (Invalid Credentials)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ____  ____   __   __ _  __ _ 
 (_   \(  _ \ / _\ (  ( \(  / )
  / /\ ) _ (/    \/    / )  ( 
 (____/(____/\_/\_/\_)__)(__\_)
                        LOGIN
────────────────────────────────────────────────────────────

  Account Number (10 digits):
  0000012345

  PIN (4 digits):
  

  ╭─────────────────────────────────────────╮
  │ ⚠ Error                                  │
  │                                          │
  │ Invalid PIN                              │
  ╰─────────────────────────────────────────╯

────────────────────────────────────────────────────────────
  [Q] Quit  [R] Register  [↵] Login
```

## Features

### Input Fields
1. **Account Number**
   - Accepts only numeric characters (0-9)
   - Maximum length: 10 digits
   - No masking (visible input)
   - Auto-advances to PIN field on Enter

2. **PIN**
   - Accepts only numeric characters (0-9)
   - Maximum length: 4 digits
   - Masked with asterisks (****)
   - Submits login on Enter

### Keyboard Shortcuts
- **Q** or **ESC**: Clear form / Exit
- **R**: Navigate to registration screen
- **Enter**: Submit login form
- **Tab**: Switch between account and PIN fields

### Validation
- Account number must be exactly 10 digits
- PIN must be exactly 4 digits
- Real-time validation feedback
- Clear error messages

### Security Features
- PIN input is always masked with asterisks
- PIN field is cleared after failed login
- No PINs are logged or displayed
- Uses bcrypt hashing for password verification

### User Feedback
- Loading spinner during authentication
- Error messages displayed in red with warning icon
- Success automatically navigates to home screen
- Clear instructions for user actions

## Component Props

```typescript
interface LoginScreenProps {
  onSuccess: () => void;    // Called when login succeeds
  onRegister?: () => void;  // Called when user presses 'R'
}
```

## Integration

### With Navigation System
```typescript
<LoginScreen
  onSuccess={() => navigateTo(AppState.HOME)}
  onRegister={() => navigateTo(AppState.REGISTER)}
/>
```

### With Service Layer
The LoginScreen uses the `useAuth` hook to access the AuthService:
```typescript
const authService = useAuth();
const result = await authService.login(accountNumber, pin);
```

## Test Accounts
For development and testing, use these pre-seeded accounts:
- Account: `0000012345`, PIN: `1111`, Balance: $100.00
- Account: `1234567890`, PIN: `1234`, Balance: $200.00

## COBOL Comparison

### COBOL ZLOGIN Map
```cobol
ZLOGIN   DFHMDI SIZE=(24,80),LINE=1,COLUMN=1
         DFHMDF POS=(3,30),LENGTH=11,INITIAL='ZBANK LOGIN'
         DFHMDF POS=(5,25),LENGTH=14,INITIAL='ACCOUNT NUMBER'
LOGACC   DFHMDF POS=(5,41),LENGTH=10,ATTRB=(UNPROT,NUM)
         DFHMDF POS=(7,25),LENGTH=3,INITIAL='PIN'
LOGPIN   DFHMDF POS=(7,41),LENGTH=4,ATTRB=(UNPROT,NUM)
```

### Modern React Ink Equivalent
- BMS `DFHMDF` → React `<Box>` and `<Text>` components
- BMS `UNPROT` → Ink `<TextInput>` component with validation
- BMS `NUM` → NumericInput component with numeric filtering
- BMS positioning → Flexbox layout with margins and padding
- BMS screen clear → State management and re-rendering

## Files

### Source Files
- `src/components/screens/LoginScreen.tsx` - Main login screen component
- `src/components/common/NumericInput.tsx` - Numeric input field component
- `src/components/common/Header.tsx` - Branded header component
- `src/components/common/Footer.tsx` - Footer with keyboard hints
- `src/components/common/ErrorMessage.tsx` - Error display component
- `src/hooks/useKeyboard.ts` - Keyboard shortcut hook
- `src/contexts/ServiceContext.tsx` - Service dependency injection

### Test Files
- `tests/components/common/NumericInput.test.ts` - Input validation tests
- `tests/hooks/useKeyboard.test.ts` - Keyboard handling tests

## Dependencies
- `ink` - Terminal UI framework
- `ink-text-input` - Text input component
- `ink-spinner` - Loading spinner component
- `react` - UI library

## Related Documentation
- [Task 06 Requirements](../../../tasks/06_build_login_screen.md)
- [COBOL Overview](../../../docs/overview.md)
- [Navigation System](../NAVIGATION.md)
- [Data Models](../DATA_MODELS.md)
