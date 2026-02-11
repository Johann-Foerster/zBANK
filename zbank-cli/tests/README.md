# zBANK CLI - Test Suite Documentation

This directory contains the comprehensive test suite for the zBANK CLI application.

## Overview

The test suite ensures code quality, functional correctness, and maintains COBOL application parity. We use **Jest** with **ts-jest** for TypeScript support and **ink-testing-library** for React Ink component testing.

## Test Statistics

- **Total Tests**: 269 tests
- **Test Suites**: 15 test files
- **Pass Rate**: 100%
- **Coverage**: 
  - Services: 94.81%
  - Models: 100%
  - Utils: 100%
  - Overall: ~80% (excluding UI components)

## Test Organization

```
tests/
├── components/          # Component tests
│   ├── common/         # Common UI component tests
│   │   ├── BalanceDisplay.test.ts
│   │   ├── CurrencyInput.test.ts
│   │   └── NumericInput.test.ts
│   └── screens/        # Screen component tests (to be added)
├── hooks/              # Custom hook tests
│   └── useKeyboard.test.ts
├── models/             # Data model validation tests
│   ├── Account.test.ts
│   └── Transaction.test.ts
├── services/           # Service layer tests
│   ├── AuthService.test.ts
│   ├── JsonStorage.test.ts
│   ├── NavigationManager.test.ts
│   ├── SessionManager.test.ts
│   └── TransactionService.test.ts
├── utils/              # Utility function tests
│   ├── crypto.test.ts
│   ├── formatter.test.ts
│   └── validation.test.ts
├── integration/        # Integration tests (to be added)
└── e2e/                # End-to-end tests (to be added)
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- AuthService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal**: Summary in console
- **HTML**: `coverage/lcov-report/index.html` (open in browser)
- **LCOV**: `coverage/lcov.info` (for CI tools)

Coverage thresholds (enforced):
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Categories

### Unit Tests

**Purpose**: Test individual functions and classes in isolation

**Location**: Mirror source structure (`tests/services/`, `tests/utils/`, etc.)

**Examples**:
- Service methods (login, deposit, withdraw)
- Utility functions (formatBalance, validatePin)
- Model schemas (Account, Transaction)

**Characteristics**:
- Fast execution (< 1ms per test)
- No external dependencies
- Use mocks for storage/services
- Focus on single unit of code

**Example**:
```typescript
describe('TransactionService', () => {
  let service: TransactionService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    service = new TransactionService(mockStorage);
  });

  it('should add amount to balance', async () => {
    const result = await service.deposit('0000012345', 5000);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(15000);
  });
});
```

### Component Tests

**Purpose**: Test React Ink component behavior and logic

**Location**: `tests/components/`

**Examples**:
- Input validation logic
- Balance formatting
- Error message display
- Keyboard shortcuts

**Note**: These test component *logic*, not actual rendering

**Example**:
```typescript
describe('CurrencyInput Validation Logic', () => {
  it('should accept valid currency formats', () => {
    expect(isValidCurrency('100.00')).toBe(true);
    expect(isValidCurrency('$50')).toBe(true);
  });

  it('should reject invalid formats', () => {
    expect(isValidCurrency('-50')).toBe(false);
    expect(isValidCurrency('abc')).toBe(false);
  });
});
```

### Integration Tests

**Purpose**: Test interactions between multiple components/services

**Location**: `tests/integration/`

**Status**: To be implemented (Task 09 goal)

**Planned Tests**:
- Login flow (UI → AuthService → Storage)
- Transaction flow (UI → TransactionService → Storage)
- Registration flow (UI → AuthService → Storage)
- Navigation flow (Screen transitions)

**Example** (planned):
```typescript
describe('Login Flow', () => {
  it('should complete full login workflow', async () => {
    const { stdin, lastFrame } = render(<App />);
    
    // Should start at login screen
    expect(lastFrame()).toContain('zBANK LOGIN');
    
    // Enter credentials
    stdin.write('0000012345\t1111\r');
    
    // Should navigate to home
    await waitFor(() => {
      expect(lastFrame()).toContain('zBANK HOME');
    });
  });
});
```

### End-to-End Tests

**Purpose**: Test complete user workflows from start to finish

**Location**: `tests/e2e/`

**Status**: To be implemented (Task 09 goal)

**Planned Tests**:
- Complete banking session (register → login → deposit → withdraw → logout)
- Error handling scenarios
- Edge cases (overdraft, invalid input, etc.)

## Test Patterns

### Service Testing Pattern

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { MyService } from '../../src/services/MyService.js';
import { MockStorage } from '../mocks/MockStorage.js';

describe('MyService', () => {
  let service: MyService;
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    service = new MyService(storage);
  });

  describe('method name', () => {
    it('should do something', async () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = await service.method(input);
      
      // Assert
      expect(result).toBeDefined();
    });
  });
});
```

### Model Testing Pattern

```typescript
import { z } from 'zod';

describe('AccountSchema', () => {
  it('should validate a valid account', () => {
    const validAccount = {
      accountNumber: '0000012345',
      pin: 'hashed-pin',
      balance: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expect(() => AccountSchema.parse(validAccount)).not.toThrow();
  });

  it('should reject invalid account number', () => {
    const invalidAccount = { accountNumber: '123', /* ... */ };
    
    expect(() => AccountSchema.parse(invalidAccount)).toThrow();
  });
});
```

### Utility Testing Pattern

```typescript
describe('formatBalance', () => {
  it('should format positive balance correctly', () => {
    expect(formatBalance(10000)).toBe('$100.00');
  });

  it('should format negative balance correctly', () => {
    expect(formatBalance(-5000)).toBe('-$50.00');
  });
});
```

## COBOL Behavior Compliance

Many tests explicitly verify COBOL application parity:

### Overdraft Tests

```typescript
describe('COBOL behavior compliance', () => {
  it('should allow overdrafts like COBOL', async () => {
    const result = await service.withdraw('0000012345', 150000);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(-140000); // Negative balance allowed
  });
});
```

### PIN Storage Tests

```typescript
it('should match COBOL PIN storage format', () => {
  // COBOL stores 1234 as 0000001234
  expect(padPinForCobol('1234')).toBe('0000001234');
});
```

### Unlimited Login Attempts

```typescript
it('should allow unlimited login attempts (matching COBOL behavior)', async () => {
  // Multiple failed attempts should not lock account
  for (let i = 0; i < 10; i++) {
    await authService.login('0000012345', '0000');
  }
  
  // Should still accept valid PIN
  const result = await authService.login('0000012345', '1111');
  expect(result.success).toBe(true);
});
```

## Mocking Strategy

### MockStorage

We use a mock storage implementation for testing services:

```typescript
class MockStorage implements IStorage {
  private accounts: Map<string, Account> = new Map();
  private transactions: Transaction[] = [];
  
  async getAccount(accountNumber: string): Promise<Account | null> {
    return this.accounts.get(accountNumber) || null;
  }
  
  // ... other methods
}
```

**Benefits**:
- Fast (in-memory, no file I/O)
- Isolated (doesn't affect real data)
- Controllable (predictable test data)
- Type-safe (implements IStorage interface)

### Test Data

Standard test accounts used across tests:

```typescript
const TEST_ACCOUNT_1 = {
  accountNumber: '0000012345',
  pin: await hashPin('1111'),
  balance: 10000, // $100.00
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const TEST_ACCOUNT_2 = {
  accountNumber: '1234567890',
  pin: await hashPin('1234'),
  balance: 20000, // $200.00
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

## Coverage Analysis

### Current Coverage by Category

| Category | Coverage | Status |
|----------|----------|--------|
| **Services** | 94.81% | ✅ Excellent |
| **Models** | 100% | ✅ Perfect |
| **Utils** | 100% | ✅ Perfect |
| **Hooks** | 100% | ✅ Perfect |
| **Components (logic)** | Varies | ⚠️ Good for common components |
| **Screens** | 0% | ❌ Need integration tests |
| **Contexts** | 0% | ❌ Need integration tests |

### Coverage Gaps

Areas that need more testing:
1. **Screen Components**: LoginScreen, HomeScreen, RegisterScreen
2. **Contexts**: NavigationContext, ServiceContext (used but not tested directly)
3. **Error Paths**: Some error handling branches not covered
4. **Edge Cases**: Boundary conditions, race conditions

### Improving Coverage

To improve coverage:

```bash
# 1. Run coverage report
npm run test:coverage

# 2. Open HTML report
open coverage/lcov-report/index.html

# 3. Identify uncovered lines (red highlighting)

# 4. Add tests for uncovered code

# 5. Re-run coverage
npm run test:coverage
```

## Testing Best Practices

### Do's

✅ **Write descriptive test names**
```typescript
// Good
it('should reject withdrawal exceeding maximum limit', async () => {});

// Avoid
it('test withdrawal', async () => {});
```

✅ **Use AAA pattern** (Arrange, Act, Assert)
```typescript
it('should do something', async () => {
  // Arrange - set up test data
  const input = 'test';
  
  // Act - execute the code being tested
  const result = await service.method(input);
  
  // Assert - verify the results
  expect(result).toBe(expected);
});
```

✅ **Test one thing per test**
```typescript
// Good - tests one aspect
it('should return error for invalid account number', async () => {});
it('should return error for invalid PIN', async () => {});

// Avoid - tests multiple things
it('should validate inputs', async () => {
  // Tests account AND PIN validation
});
```

✅ **Use meaningful variable names**
```typescript
// Good
const validAccountNumber = '0000012345';
const hashedPin = await hashPin('1111');

// Avoid
const x = '0000012345';
const y = await hashPin('1111');
```

### Don'ts

❌ **Don't test implementation details**
```typescript
// Bad - testing internal state
expect(service['privateField']).toBe(value);

// Good - testing public behavior
expect(service.getResult()).toBe(value);
```

❌ **Don't depend on test execution order**
```typescript
// Bad - tests depend on each other
it('should create account', () => { /* account created */ });
it('should update account', () => { /* depends on previous test */ });

// Good - each test independent
beforeEach(() => {
  // Set up fresh state for each test
});
```

❌ **Don't use real data in tests**
```typescript
// Bad - uses real data files
const storage = new JsonStorage('./data/accounts.json');

// Good - uses mock
const storage = new MockStorage();
```

## Debugging Tests

### Debug Single Test

```bash
# Run specific test with verbose output
npm test -- AuthService.test.ts --verbose

# Run with Node debugger
node --inspect-brk node_modules/.bin/jest AuthService.test.ts
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--no-cache",
    "${file}"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Common Issues

**Problem**: Tests fail after dependency update

**Solution**:
```bash
npm run test -- --clearCache
npm test
```

**Problem**: Coverage reports missing files

**Solution**: Check `jest.config.js` `collectCoverageFrom` patterns

**Problem**: Type errors in tests

**Solution**: Ensure test imports use `.js` extensions for ESM compatibility

## CI/CD Integration

Tests run automatically in GitHub Actions (if configured):

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Future Test Improvements

### Planned Additions

1. **Integration Tests**
   - Screen workflow tests
   - Context integration tests
   - Service integration tests

2. **E2E Tests**
   - Complete user journeys
   - Error scenarios
   - Edge cases

3. **Performance Tests**
   - Response time benchmarks
   - Load testing for storage
   - Memory usage tests

4. **Visual Regression Tests**
   - Screenshot comparison for screens
   - Terminal output verification

5. **Security Tests**
   - PIN hashing strength tests
   - Input sanitization tests
   - SQL injection prevention (when DB added)

## Contributing

When adding new features:

1. **Write tests first** (TDD)
2. **Maintain coverage** above 80%
3. **Follow patterns** in existing tests
4. **Update this README** if adding new test categories
5. **Run full suite** before committing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ink-testing-library](https://github.com/vadimdemedes/ink-testing-library)
- [Testing Best Practices](https://testingjavascript.com/)
- [COBOL Application Reference](../../docs/overview.md)

---

**Happy Testing!** Well-tested code is maintainable code.
