# Task 03: Implement Authentication System

## Objective
Create an authentication system to replicate the COBOL login mechanism, with PIN hashing as the only enhancement for basic security.

## Background
The COBOL application uses simple PIN comparison:
- User enters account number (10 digits) and PIN (4 digits)
- PIN stored in plain text in VSAM
- No account lockout or brute-force protection
- No encryption

We need to replicate this behavior but use PIN hashing for basic security (storing plain text passwords is a critical security vulnerability that must be addressed even in a faithful migration).

## Requirements

### Authentication Service
Create an authentication service that handles:
- User login with account number and PIN
- PIN hashing and verification (security requirement only)
- Simple session management (like COBOL's VSAM lock)
- Logout functionality

### Security Note
**The only enhancement from COBOL is PIN hashing.** We will NOT implement:
- Account lockout after failed attempts
- Brute-force protection
- Audit logging

This stays true to the original COBOL implementation.

## Deliverables

1. **Authentication Service**
   ```typescript
   // src/services/AuthService.ts
   interface IAuthService {
     login(accountNumber: string, pin: string): Promise<AuthResult>;
     logout(): Promise<void>;
     getCurrentUser(): Account | null;
     isAuthenticated(): boolean;
     changePin(oldPin: string, newPin: string): Promise<boolean>;
     resetFailedAttempts(accountNumber: string): Promise<void>;
   }
   
   interface AuthResult {
     success: boolean;
     account?: Account;
     error?: string;
     attemptsRemaining?: number;
   }
   ```

2. **PIN Hashing Utilities**
   ```typescript
   // src/utils/crypto.ts
   export async function hashPin(pin: string): Promise<string>;
   export async function verifyPin(pin: string, hash: string): Promise<boolean>;
   ```

3. **Session Manager**
   ```typescript
   // src/services/SessionManager.ts
   class SessionManager {
     private currentAccount: Account | null;
     private loginTime: Date | null;
     
     setSession(account: Account): void;
     clearSession(): void;
     getSession(): Account | null;
     isSessionActive(): boolean;
   }
   ```

4. **Login Validation**
   - Account number must be exactly 10 digits
   - PIN must be exactly 4 digits
   - Account must exist in storage
   - Account must not be locked
   - PIN must match hashed value

## Acceptance Criteria

- [x] Authentication service implemented
- [x] PIN hashing with bcrypt works correctly
- [x] Failed login attempts are tracked
- [x] Account locks after 3 failed attempts
- [x] Successful login returns account details
- [x] Session persists during application runtime
- [x] Logout clears session properly
- [x] All authentication events are logged
- [x] Unit tests cover all authentication scenarios

## Implementation Steps

1. Install dependencies:
   ```bash
   npm install bcrypt
   npm install -D @types/bcrypt
   ```

2. Create `src/utils/crypto.ts` with PIN hashing functions

3. Create `src/services/AuthService.ts` with login logic

4. Create `src/services/SessionManager.ts` for session handling

5. Simple login mechanism (matching COBOL):
   - No failed attempt tracking
   - No account lockout
   - Just PIN verification

6. Write comprehensive unit tests

7. Update seed data to include hashed PINs

## Testing

### Unit Tests
```typescript
describe('AuthService', () => {
  it('should login with valid credentials', async () => {
    const result = await authService.login('0000012345', '1111');
    expect(result.success).toBe(true);
    expect(result.account).toBeDefined();
  });
  
  it('should reject invalid PIN', async () => {
    const result = await authService.login('0000012345', '9999');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid PIN');
  });
});
```

### Integration Tests
- Test login flow with real storage
- Verify session persistence
- Test concurrent login attempts
- Validate audit log entries

## Security Considerations

### COBOL vs Modern Approach
| Aspect | COBOL | React CLI |
|--------|------------------|-----------------|
| PIN Storage | Plain text | bcrypt hash (security only) |
| Failed Attempts | Unlimited | Unlimited (matching COBOL) |
| Session Management | VSAM lock only | In-memory session |
| Audit Trail | None | None (matching COBOL) |
| Brute Force Protection | None | None (matching COBOL) |

### Implementation Note
The only enhancement from COBOL is PIN hashing. This is a critical security requirement that cannot be avoided (storing plain text passwords is a severe security vulnerability).

All other aspects stay true to the original COBOL behavior.

## Migration from COBOL

### COBOL Login Flow (State 0)
```cobol
EXEC CICS READ
    DATASET(WS-FILE-NAME)
    INTO(WS-FILE-REC)
    RIDFLD(ACCNO)
    KEYLENGTH(10)
    UPDATE
    RESP(WS-RESP-CODE)
END-EXEC

IF WS-PIN = PIN-INPUT THEN
    MOVE 1 TO SCREEN-STATE
END-IF
```

### Modern Login Flow
```typescript
async login(accountNumber: string, pin: string): Promise<AuthResult> {
  // Get account from storage
  const account = await storage.getAccount(accountNumber);
  
  if (!account) {
    return { success: false, error: 'Account not found' };
  }
  
  if (account.isLocked) {
    return { success: false, error: 'Account is locked' };
  }
  
  // Verify PIN
  const valid = await verifyPin(pin, account.pin);
  
  if (!valid) {
    // Increment failed attempts
    account.failedLoginAttempts++;
    if (account.failedLoginAttempts >= 3) {
      account.isLocked = true;
    }
    await storage.updateAccount(accountNumber, account);
    
    return {
      success: false,
      error: 'Invalid PIN',
      attemptsRemaining: 3 - account.failedLoginAttempts
    };
  }
  
  // Reset failed attempts
  account.failedLoginAttempts = 0;
  await storage.updateAccount(accountNumber, account);
  
  // Create session
  sessionManager.setSession(account);
  
  return { success: true, account };
}
```

## Related Tasks
- Task 02: Design Data Models and Storage Layer
- Task 04: Create CLI Menu Navigation
- Task 06: Build Login Screen Component

## References
- COBOL authentication: `docs/overview.md` (lines 103-108, 403-413)
- Security issues: `docs/overview.md` (lines 441-475)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
