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
       
       setAccountNumber(accNum);
       setStep(RegistrationStep.PIN);
       setError('');
     };
     
     const handlePinSubmit = () => {
       if (pin.length !== 4) {
         setError('PIN must be exactly 4 digits');
         return;
       }
       
       setStep(RegistrationStep.CONFIRM_PIN);
       setError('');
     };
     
     const handleConfirmPinSubmit = () => {
       if (pin !== confirmPin) {
         setError('PINs do not match');
         setConfirmPin('');
         return;
       }
       
       setStep(RegistrationStep.INITIAL_DEPOSIT);
       setError('');
     };
     
     const handleInitialDepositSubmit = () => {
       const amount = parseFloat(initialDeposit);
       if (isNaN(amount) || amount < 0) {
         setError('Invalid amount');
         return;
       }
       
       setStep(RegistrationStep.CONFIRM);
       setError('');
     };
     
     const handleConfirm = async () => {
       setIsProcessing(true);
       setError('');
       
       try {
         const hashedPin = await hashPin(pin);
         const balanceInCents = Math.floor(parseFloat(initialDeposit) * 100);
         
         await storage.createAccount({
           accountNumber,
           pin: hashedPin,
           balance: balanceInCents,
           isLocked: false,
           failedLoginAttempts: 0
         });
         
         onSuccess();
       } catch (error) {
         setError('Failed to create account');
       } finally {
         setIsProcessing(false);
       }
     };
     
     const renderStep = () => {
       switch (step) {
         case RegistrationStep.ACCOUNT_NUMBER:
           return (
             <Box flexDirection="column">
               <Text>Account Number (leave blank to auto-generate):</Text>
               <TextInput
                 value={accountNumber}
                 onChange={setAccountNumber}
                 onSubmit={handleAccountNumberSubmit}
                 placeholder="0000000000"
               />
             </Box>
           );
           
         case RegistrationStep.PIN:
           return (
             <Box flexDirection="column">
               <Text>Enter a 4-digit PIN:</Text>
               <TextInput
                 value={pin}
                 onChange={setPin}
                 onSubmit={handlePinSubmit}
                 mask="*"
                 placeholder="****"
               />
             </Box>
           );
           
         case RegistrationStep.CONFIRM_PIN:
           return (
             <Box flexDirection="column">
               <Text>Confirm your PIN:</Text>
               <TextInput
                 value={confirmPin}
                 onChange={setConfirmPin}
                 onSubmit={handleConfirmPinSubmit}
                 mask="*"
                 placeholder="****"
               />
             </Box>
           );
           
         case RegistrationStep.INITIAL_DEPOSIT:
           return (
             <Box flexDirection="column">
               <Text>Initial deposit amount (optional):</Text>
               <CurrencyInput
                 value={initialDeposit}
                 onChange={setInitialDeposit}
                 onSubmit={handleInitialDepositSubmit}
               />
             </Box>
           );
           
         case RegistrationStep.CONFIRM:
           return (
             <Box flexDirection="column">
               <Text bold>Confirm Registration:</Text>
               <Text>Account Number: {accountNumber}</Text>
               <Text>Initial Deposit: ${initialDeposit}</Text>
               <Box marginTop={1}>
                 <Text color="gray">[Y] Confirm  [N] Cancel</Text>
               </Box>
             </Box>
           );
       }
     };
     
     return (
       <Box flexDirection="column" padding={1}>
         <Header title="zBANK REGISTER" />
         
         <Box flexDirection="column" marginTop={2}>
           {renderStep()}
         </Box>
         
         {error && (
           <Box marginTop={1}>
             <Text color="red">✗ {error}</Text>
           </Box>
         )}
         
         {isProcessing && (
           <Box marginTop={1}>
             <Spinner type="dots" />
             <Text> Creating account...</Text>
           </Box>
         )}
         
         <Footer
           actions={[
             { key: 'Q', label: 'Cancel', handler: onCancel },
           ]}
         />
       </Box>
     );
   };
   ```

2. **Account Number Generator Service**
   ```typescript
   // src/services/AccountNumberService.ts
   export class AccountNumberService {
     async generateUniqueAccountNumber(storage: IStorage): Promise<string> {
       let attempts = 0;
       const maxAttempts = 10;
       
       while (attempts < maxAttempts) {
         const accountNumber = this.generate();
         const existing = await storage.getAccount(accountNumber);
         
         if (!existing) {
           return accountNumber;
         }
         
         attempts++;
       }
       
       throw new Error('Failed to generate unique account number');
     }
     
     private generate(): string {
       // Generate 10-digit number
       // Could use more sophisticated algorithm (checksum, bank code, etc.)
       const random = Math.floor(1000000000 + Math.random() * 9000000000);
       return random.toString();
     }
     
     validate(accountNumber: string): boolean {
       // Must be exactly 10 digits
       return /^\d{10}$/.test(accountNumber);
     }
   }
   ```

3. **Registration Wizard Component**
   ```typescript
   // src/components/common/RegistrationWizard.tsx
   interface WizardStep {
     title: string;
     description: string;
     component: React.ReactNode;
   }
   
   export const RegistrationWizard: React.FC<WizardProps> = ({
     steps,
     currentStep,
     onNext,
     onBack,
     onCancel
   }) => {
     const progress = ((currentStep + 1) / steps.length) * 100;
     
     return (
       <Box flexDirection="column">
         <Box flexDirection="column" marginBottom={1}>
           <Text>Step {currentStep + 1} of {steps.length}</Text>
           <ProgressBar percent={progress} />
         </Box>
         
         <Box flexDirection="column" marginTop={1}>
           <Text bold>{steps[currentStep].title}</Text>
           <Text color="gray">{steps[currentStep].description}</Text>
         </Box>
         
         <Box marginTop={2}>
           {steps[currentStep].component}
         </Box>
       </Box>
     );
   };
   ```

4. **PIN Strength Validator**
   ```typescript
   // src/utils/pinValidator.ts
   export interface PinStrength {
     score: number;  // 0-100
     feedback: string[];
   }
   
   export function validatePinStrength(pin: string): PinStrength {
     const feedback: string[] = [];
     let score = 0;
     
     // Check length
     if (pin.length === 4) {
       score += 25;
     } else {
       feedback.push('PIN must be 4 digits');
       return { score: 0, feedback };
     }
     
     // Check if all digits are the same
     if (/^(.)\1+$/.test(pin)) {
       feedback.push('Avoid using repeated digits (e.g., 1111)');
     } else {
       score += 25;
     }
     
     // Check for sequential digits
     const isSequential = checkSequential(pin);
     if (isSequential) {
       feedback.push('Avoid sequential patterns (e.g., 1234)');
     } else {
       score += 25;
     }
     
     // Check against common PINs
     const commonPins = ['1234', '0000', '1111', '1212', '7777'];
     if (commonPins.includes(pin)) {
       feedback.push('This is a commonly used PIN');
     } else {
       score += 25;
     }
     
     if (feedback.length === 0) {
       feedback.push('Strong PIN');
     }
     
     return { score, feedback };
   }
   
   function checkSequential(pin: string): boolean {
     const digits = pin.split('').map(Number);
     
     // Check ascending
     let isAscending = true;
     let isDescending = true;
     
     for (let i = 1; i < digits.length; i++) {
       if (digits[i] !== digits[i - 1] + 1) isAscending = false;
       if (digits[i] !== digits[i - 1] - 1) isDescending = false;
     }
     
     return isAscending || isDescending;
   }
   ```

## Acceptance Criteria

- [x] Registration screen renders with multi-step wizard
- [x] Account number can be auto-generated or manually entered
- [x] Duplicate account numbers are rejected
- [x] PIN must be exactly 4 digits
- [x] PIN confirmation validates match
- [x] PIN strength feedback provided
- [x] Initial deposit is optional
- [x] Final confirmation step shows all details
- [x] Account created successfully in storage
- [x] PIN hashed before storage
- [x] Success returns to login screen
- [x] Cancel returns to login without creating account
- [x] All steps have validation

## Implementation Steps

1. Create `src/services/AccountNumberService.ts`

2. Create `src/utils/pinValidator.ts`

3. Create `src/components/common/RegistrationWizard.tsx`

4. Create `src/components/common/ProgressBar.tsx`

5. Implement `src/components/screens/RegisterScreen.tsx`

6. Wire up storage service for account creation

7. Add PIN hashing integration

8. Implement all validation checks

9. Add success/error messaging

10. Write comprehensive tests

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
