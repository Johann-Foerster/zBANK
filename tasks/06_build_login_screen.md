# Task 06: Build Login Screen Component

## Objective
Create the React Ink login screen component that replicates the COBOL ZLOGIN BMS map functionality.

## Background
The COBOL application uses BMS map ZLOGIN with:
- Title: "ZBANK LOGIN"
- ASCII art logo
- Account number input (10 digits)
- PIN input (4 digits)
- Action selector (Q=Exit, R=Register)
- Information/error message area

## Requirements

### Component Specification
```typescript
interface LoginScreenProps {
  onSuccess: (account: Account) => void;
  onRegister: () => void;
  onExit: () => void;
}
```

### UI Elements
1. **Header**: zBANK branding with ASCII art
2. **Account Input**: 10-digit numeric input field
3. **PIN Input**: 4-digit masked input field
4. **Action Buttons**: Login, Register, Exit
5. **Message Area**: Display errors and information
6. **Status Indicator**: Loading state during authentication

## Deliverables

1. **LoginScreen Component**
   ```typescript
   // src/components/screens/LoginScreen.tsx
   import React, { useState } from 'react';
   import { Box, Text } from 'ink';
   import TextInput from 'ink-text-input';
   import Spinner from 'ink-spinner';
   
   export const LoginScreen: React.FC<LoginScreenProps> = ({
     onSuccess,
     onRegister,
     onExit
   }) => {
     const [accountNumber, setAccountNumber] = useState('');
     const [pin, setPin] = useState('');
     const [error, setError] = useState('');
     const [isLoading, setIsLoading] = useState(false);
     const [focusedField, setFocusedField] = useState<'account' | 'pin'>('account');
     
     const handleLogin = async () => {
       setIsLoading(true);
       setError('');
       
       const result = await authService.login(accountNumber, pin);
       
       if (result.success) {
         onSuccess(result.account!);
       } else {
         setError(result.error || 'Login failed');
         setPin('');  // Clear PIN on failure
       }
       
       setIsLoading(false);
     };
     
     return (
       <Box flexDirection="column" padding={1}>
         <Header title="zBANK LOGIN" />
         
         <Box flexDirection="column" marginTop={1}>
           <Text>Account Number (10 digits):</Text>
           <TextInput
             value={accountNumber}
             onChange={setAccountNumber}
             onSubmit={() => setFocusedField('pin')}
             placeholder="0000000000"
           />
         </Box>
         
         <Box flexDirection="column" marginTop={1}>
           <Text>PIN (4 digits):</Text>
           <TextInput
             value={pin}
             onChange={setPin}
             onSubmit={handleLogin}
             mask="*"
             placeholder="****"
           />
         </Box>
         
         {error && (
           <Box marginTop={1}>
             <Text color="red">{error}</Text>
           </Box>
         )}
         
         {isLoading && (
           <Box marginTop={1}>
             <Spinner type="dots" />
             <Text> Authenticating...</Text>
           </Box>
         )}
         
         <Footer
           actions={[
             { key: 'Q', label: 'Quit', handler: onExit },
             { key: 'R', label: 'Register', handler: onRegister },
           ]}
         />
       </Box>
     );
   };
   ```

2. **Input Validation Component**
   ```typescript
   // src/components/common/NumericInput.tsx
   export const NumericInput: React.FC<NumericInputProps> = ({
     value,
     onChange,
     maxLength,
     mask
   }) => {
     const handleChange = (input: string) => {
       // Only allow numeric input
       const numeric = input.replace(/\D/g, '');
       // Limit to maxLength
       const limited = numeric.slice(0, maxLength);
       onChange(limited);
     };
     
     return (
       <TextInput
         value={value}
         onChange={handleChange}
         mask={mask}
       />
     );
   };
   ```

3. **Brand Header Component**
   ```typescript
   // src/components/common/Header.tsx
   export const Header: React.FC<{ title: string }> = ({ title }) => {
     return (
       <Box flexDirection="column" alignItems="center">
         <Text color="cyan" bold>
           {title}
         </Text>
         <Box marginTop={1}>
           <Text color="cyan">
             ╔══════════════╗{'\n'}
             ║    zBank     ║{'\n'}
             ╚══════════════╝
           </Text>
         </Box>
       </Box>
     );
   };
   ```

4. **Footer Component**
   ```typescript
   // src/components/common/Footer.tsx
   interface Action {
     key: string;
     label: string;
     handler: () => void;
   }
   
   export const Footer: React.FC<{ actions: Action[] }> = ({ actions }) => {
     return (
       <Box marginTop={2} borderStyle="single" borderTop>
         {actions.map((action, index) => (
           <Box key={action.key} marginRight={2}>
             <Text color="gray">
               [{action.key}] {action.label}
             </Text>
           </Box>
         ))}
       </Box>
     );
   };
   ```

5. **Keyboard Handler Hook**
   ```typescript
   // src/hooks/useKeyboard.ts
   import { useInput } from 'ink';
   
   export function useKeyboard(handlers: Record<string, () => void>) {
     useInput((input, key) => {
       const handler = handlers[input.toUpperCase()];
       if (handler) {
         handler();
       }
       
       if (key.escape) {
         handlers['Q']?.();  // ESC = Quit
       }
     });
   }
   ```

## Acceptance Criteria

- [x] Login screen renders with proper layout
- [x] Account number input accepts only 10 numeric digits
- [x] PIN input accepts only 4 numeric digits
- [x] PIN input is masked with asterisks
- [x] Enter key submits login form
- [x] Loading spinner shows during authentication
- [x] Error messages display clearly in red
- [x] Keyboard shortcuts work (Q=Quit, R=Register)
- [x] Tab/Enter navigation between fields works
- [x] Screen clears PIN on failed login
- [x] Successful login navigates to home screen

## Implementation Steps

1. Install Ink input components:
   ```bash
   npm install ink-text-input ink-spinner ink-select-input
   ```

2. Create `src/components/common/Header.tsx`

3. Create `src/components/common/Footer.tsx`

4. Create `src/components/common/NumericInput.tsx`

5. Create `src/hooks/useKeyboard.ts`

6. Implement `src/components/screens/LoginScreen.tsx`

7. Wire up authentication service

8. Add keyboard shortcut handling

9. Test all input validations

10. Write component tests

## Testing

### Component Tests
```typescript
import { render } from 'ink-testing-library';
import { LoginScreen } from './LoginScreen';

describe('LoginScreen', () => {
  it('should render login form', () => {
    const { lastFrame } = render(
      <LoginScreen 
        onSuccess={jest.fn()} 
        onRegister={jest.fn()} 
        onExit={jest.fn()} 
      />
    );
    
    expect(lastFrame()).toContain('zBANK LOGIN');
    expect(lastFrame()).toContain('Account Number');
    expect(lastFrame()).toContain('PIN');
  });
  
  it('should limit account number to 10 digits', () => {
    const { stdin, lastFrame } = render(<LoginScreen {...props} />);
    
    stdin.write('12345678901234');  // 14 digits
    
    // Should only show first 10
    expect(lastFrame()).toContain('1234567890');
  });
  
  it('should mask PIN input', () => {
    const { stdin, lastFrame } = render(<LoginScreen {...props} />);
    
    // Navigate to PIN field and enter
    stdin.write('\t');  // Tab to PIN
    stdin.write('1234');
    
    expect(lastFrame()).toContain('****');
    expect(lastFrame()).not.toContain('1234');
  });
  
  it('should show error message on failed login', async () => {
    const { stdin, lastFrame, waitUntilExit } = render(<LoginScreen {...props} />);
    
    // Mock failed login
    mockAuthService.login.mockResolvedValue({
      success: false,
      error: 'Invalid PIN'
    });
    
    stdin.write('0000012345');
    stdin.write('\t');
    stdin.write('9999');
    stdin.write('\r');  // Enter
    
    await waitFor(() => {
      expect(lastFrame()).toContain('Invalid PIN');
    });
  });
});
```

## UI Layout

### Login Screen Mockup
```
┌─────────────────────────────────────────────────────────────┐
│                       zBANK LOGIN                            │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
│                                                              │
│  Account Number (10 digits):                                │
│  0000012345                                                  │
│                                                              │
│  PIN (4 digits):                                             │
│  ****                                                        │
│                                                              │
│  ⚠ Invalid PIN. 2 attempts remaining.                       │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [Q] Quit  [R] Register  [↵] Login                          │
└─────────────────────────────────────────────────────────────┘
```

## COBOL BMS Map Comparison

### COBOL ZLOGIN Map (Excerpt)
```cobol
ZLOGIN   DFHMDI SIZE=(24,80),LINE=1,COLUMN=1
         DFHMDF POS=(3,30),LENGTH=11,INITIAL='ZBANK LOGIN'
         DFHMDF POS=(5,25),LENGTH=14,INITIAL='ACCOUNT NUMBER'
LOGACC   DFHMDF POS=(5,41),LENGTH=10,ATTRB=(UNPROT,NUM)
         DFHMDF POS=(7,25),LENGTH=3,INITIAL='PIN'
LOGPIN   DFHMDF POS=(7,41),LENGTH=4,ATTRB=(UNPROT,NUM)
LOGACT   DFHMDF POS=(22,25),LENGTH=1,ATTRB=UNPROT
         DFHMDF POS=(22,27),LENGTH=20,INITIAL='Q=EXIT, R=REGISTER'
```

### Modern React Ink Equivalent
- BMS `DFHMDF` → React `<Box>` and `<Text>` components
- BMS `UNPROT` → Ink `<TextInput>` component
- BMS `NUM` → Custom numeric validation in `NumericInput`
- BMS positioning → Flexbox layout with `flexDirection` and margins

## Accessibility Features

1. **Keyboard Navigation**: Full keyboard support, no mouse required
2. **Clear Labels**: Each input field has descriptive label
3. **Error Messages**: Clear, actionable error messages
4. **Visual Feedback**: Spinner indicates loading state
5. **Input Masking**: PIN security with asterisk masking

## Security Considerations

1. **PIN Masking**: Always mask PIN input with asterisks
2. **Clear on Failure**: Clear PIN field after failed login
3. **No PIN in Memory**: Don't store PIN in state longer than necessary
4. **Rate Limiting**: Consider adding delay after failed attempts
5. **Logging**: Never log PINs or sensitive data

## Related Tasks
- Task 03: Implement Authentication System
- Task 04: Create CLI Menu Navigation
- Task 07: Build Home/Transaction Screen
- Task 08: Build Registration Screen

## References
- COBOL ZLOGIN map: `docs/overview.md` (lines 136-145)
- Login state machine: `docs/overview.md` (lines 103-108)
- [React Ink Text Input](https://github.com/vadimdemedes/ink-text-input)
- [Ink Testing Library](https://github.com/vadimdemedes/ink-testing-library)
