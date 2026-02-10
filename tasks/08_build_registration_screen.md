# Task 08: Build Registration Screen

## Objective
Create the React Ink registration screen component matching the COBOL partial implementation (skeleton only).

## Background
The COBOL ZRGSTR screen exists but registration logic is incomplete - it's a skeleton/placeholder. To stay true to the original, we'll implement a similar skeleton that shows the UI but doesn't actually create accounts.

## Requirements

### Component Specification
```typescript
interface RegisterScreenProps {
  onBack: () => void;
}
```

### Registration Screen
Display registration UI matching COBOL but keep it as a placeholder:
1. Show account number field
2. Show PIN fields
3. Display "Registration not yet implemented" message
4. Allow return to login (Q key)

## Deliverables

1. **RegisterScreen Component (Skeleton Only)**
   ```typescript
   // src/components/screens/RegisterScreen.tsx
   import React from 'react';
   import { Box, Text } from 'ink';
   import TextInput from 'ink-text-input';
   
   export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onBack }) => {
     const [accountNumber, setAccountNumber] = useState('');
     const [pin, setPin] = useState('');
     
     return (
       <Box flexDirection="column" padding={1}>
         <Header title="zBANK REGISTER" />
         
         <Box flexDirection="column" marginTop={2}>
           <Text>Account Number (10 digits):</Text>
           <TextInput
             value={accountNumber}
             onChange={setAccountNumber}
             placeholder="0000000000"
           />
         </Box>
         
         <Box flexDirection="column" marginTop={1}>
           <Text>PIN (4 digits):</Text>
           <TextInput
             value={pin}
             onChange={setPin}
             mask="*"
             placeholder="****"
           />
         </Box>
         
         <Box marginTop={2}>
           <Text color="yellow">
             ⚠ Registration functionality not yet implemented (matching COBOL)
           </Text>
         </Box>
         
         <Footer
           actions={[
             { key: 'Q', label: 'Back to Login', handler: onBack },
           ]}
         />
       </Box>
     );
   };
   ```

**Note**: This matches the COBOL implementation which has the UI but no actual registration logic.

## Acceptance Criteria

- [x] Registration screen renders with skeleton UI
- [x] Account number input field displayed (10 digits)
- [x] PIN input field displayed (4 digits, masked)
- [x] Clear message indicating registration not implemented
- [x] Q key returns to login screen
- [x] Matches COBOL partial implementation (UI only, no account creation)
- [x] No actual registration logic or account creation

## Implementation Steps

1. Create `src/components/screens/RegisterScreen.tsx` with skeleton component

2. Add input fields for account number and PIN (UI only)

3. Display "not yet implemented" message

4. Wire up navigation back to login screen

5. Test that screen renders and navigation works

## Testing

### Component Tests
```typescript
describe('RegisterScreen', () => {
  it('should auto-generate account number if not provided', async () => {
    const { stdin, lastFrame } = render(<RegisterScreen {...props} />);
    
    stdin.write('\r');  // Submit without entering account number
    
    await waitFor(() => {
      expect(lastFrame()).toContain('Enter a 4-digit PIN');
    });
  });
  
  it('should reject mismatched PIN confirmation', async () => {
    const { stdin, lastFrame } = render(<RegisterScreen {...props} />);
    
    // Skip account number
    stdin.write('\r');
    
    // Enter PIN
    stdin.write('1234');
    stdin.write('\r');
    
    // Enter different confirmation
    stdin.write('4321');
    stdin.write('\r');
    
    await waitFor(() => {
      expect(lastFrame()).toContain('PINs do not match');
    });
  });
  
  it('should create account successfully', async () => {
    mockStorage.createAccount.mockResolvedValue({
      accountNumber: '1234567890',
      balance: 0,
      // ... other fields
    });
    
    const onSuccess = jest.fn();
    const { stdin } = render(<RegisterScreen onSuccess={onSuccess} />);
    
    // Complete all steps
    stdin.write('\r');       // Auto-generate account
    stdin.write('1234\r');   // Enter PIN
    stdin.write('1234\r');   // Confirm PIN
    stdin.write('0.00\r');   // No initial deposit
    stdin.write('y');        // Confirm
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
```

### Service Tests
```typescript
describe('AccountNumberService', () => {
  it('should generate valid 10-digit account number', () => {
    const service = new AccountNumberService();
    const accountNumber = service.generate();
    
    expect(accountNumber).toMatch(/^\d{10}$/);
    expect(accountNumber.length).toBe(10);
  });
  
  it('should generate unique account numbers', async () => {
    const numbers = new Set();
    
    for (let i = 0; i < 1000; i++) {
      const num = await service.generateUniqueAccountNumber(mockStorage);
      numbers.add(num);
    }
    
    expect(numbers.size).toBe(1000);  // All unique
  });
});

describe('PIN Validator', () => {
  it('should reject weak PINs', () => {
    const weak = ['1111', '1234', '0000'];
    
    weak.forEach(pin => {
      const result = validatePinStrength(pin);
      expect(result.score).toBeLessThan(100);
      expect(result.feedback.length).toBeGreaterThan(0);
    });
  });
  
  it('should approve strong PINs', () => {
    const strong = ['8256', '7319', '4927'];
    
    strong.forEach(pin => {
      const result = validatePinStrength(pin);
      expect(result.score).toBe(100);
    });
  });
});
```

## UI Layout

### Registration Step 1 - Account Number
```
┌─────────────────────────────────────────────────────────────┐
│                     zBANK REGISTER                           │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
│                                                              │
│  Step 1 of 5                                                │
│  ▓▓▓▓▓░░░░░░░░░░░░░░ 20%                                    │
│                                                              │
│  Account Number                                             │
│  Set up your account number                                 │
│                                                              │
│  Account Number (leave blank to auto-generate):            │
│  _                                                          │
│                                                              │
│  Press Enter to auto-generate                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [Q] Cancel                                                 │
└─────────────────────────────────────────────────────────────┘
```

### Registration Step 2 - PIN
```
┌─────────────────────────────────────────────────────────────┐
│                     zBANK REGISTER                           │
│                    ╔══════════════╗                          │
│                    ║    zBank     ║                          │
│                    ╚══════════════╝                          │
│                                                              │
│  Step 2 of 5                                                │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░ 40%                                    │
│                                                              │
│  Set PIN                                                    │
│  Create a secure 4-digit PIN                                │
│                                                              │
│  Enter a 4-digit PIN:                                       │
│  ****                                                       │
│                                                              │
│  ⚠ Avoid using repeated digits (e.g., 1111)                │
│  ⚠ This is a commonly used PIN                             │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  [Q] Cancel                                                 │
└─────────────────────────────────────────────────────────────┘
```

## COBOL Comparison

### COBOL ZRGSTR Map (Incomplete)
```cobol
ZRGSTR   DFHMDI SIZE=(24,80),LINE=1,COLUMN=1
         DFHMDF POS=(3,30),LENGTH=14,INITIAL='ZBANK REGISTER'
REGACC   DFHMDF POS=(10,30),LENGTH=10,ATTRB=(UNPROT,NUM)
REGPIN   DFHMDF POS=(12,30),LENGTH=4,ATTRB=(UNPROT,NUM)
REGACT   DFHMDF POS=(14,30),LENGTH=1,ATTRB=UNPROT
```

**COBOL Issues:**
- No actual registration logic implemented
- No PIN confirmation
- No account uniqueness check
- No initial balance setup

**Modern Improvements:**
- Complete multi-step registration flow
- PIN confirmation and strength validation
- Auto-generate unique account numbers
- Initial deposit option
- Comprehensive validation
- User-friendly wizard interface

## Related Tasks
- Task 02: Design Data Models and Storage Layer
- Task 03: Implement Authentication System
- Task 04: Create CLI Menu Navigation
- Task 06: Build Login Screen Component

## References
- COBOL ZRGSTR map: `docs/overview.md` (lines 158-167)
- Registration state: `docs/overview.md` (lines 119-122)
