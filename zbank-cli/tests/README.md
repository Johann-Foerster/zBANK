# zBANK CLI - Test Suite

Comprehensive test suite ensuring code quality and COBOL application parity.

## Test Statistics

- **Total**: 269 tests across 15 test suites
- **Pass Rate**: 100%
- **Coverage**: ~95% services, 100% models/utils

## Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode (auto-rerun)
npm run test:coverage    # Coverage report
npm test -- AuthService  # Run specific file
```

## Test Organization

```
tests/
├── components/    # UI component tests
├── hooks/         # Custom hook tests
├── models/        # Data model validation
├── services/      # Business logic tests
└── utils/         # Utility function tests
```

Tests mirror the `src/` directory structure.

## Test Patterns

### Service Test Example
```typescript
describe('TransactionService', () => {
  let service: TransactionService;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    service = new TransactionService(mockStorage);
  });

  it('should add amount to balance on deposit', async () => {
    const result = await service.deposit('0000012345', 5000);
    expect(result.success).toBe(true);
    expect(result.newBalance).toBe(15000);
  });
});
```

### Model Validation Test Example
```typescript
describe('AccountSchema', () => {
  it('should validate correct account', () => {
    const validAccount = {
      accountNumber: '0000012345',
      pin: 'hashed-pin',
      balance: 10000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    expect(() => AccountSchema.parse(validAccount)).not.toThrow();
  });
});
```

## COBOL Behavior Compliance

Tests explicitly verify COBOL parity:

```typescript
it('should allow overdrafts like COBOL', async () => {
  const result = await service.withdraw('0000012345', 150000);
  expect(result.success).toBe(true);
  expect(result.newBalance).toBe(-140000); // Negative OK
});
```

## Coverage

| Category | Coverage | Status |
|----------|----------|--------|
| Services | 94.81% | ✅ Excellent |
| Models   | 100%   | ✅ Perfect |
| Utils    | 100%   | ✅ Perfect |
| Hooks    | 100%   | ✅ Perfect |

## Best Practices

✅ **Write descriptive test names**  
✅ **Use AAA pattern** (Arrange, Act, Assert)  
✅ **Test one thing per test**  
✅ **Use meaningful variable names**  

❌ **Don't test implementation details**  
❌ **Don't depend on test execution order**  
❌ **Don't use real data files**

## Test Data

Standard test accounts:
```typescript
const TEST_ACCOUNT_1 = {
  accountNumber: '0000012345',
  pin: await hashPin('1111'),
  balance: 10000, // $100.00
};

const TEST_ACCOUNT_2 = {
  accountNumber: '1234567890',
  pin: await hashPin('1234'),
  balance: 20000, // $200.00
};
```

## Mocking

Use `MockStorage` for testing services:
```typescript
class MockStorage implements IStorage {
  private accounts: Map<string, Account> = new Map();
  
  async getAccount(accountNumber: string): Promise<Account | null> {
    return this.accounts.get(accountNumber) || null;
  }
}
```

**Benefits**: Fast, isolated, controllable, type-safe.

## Debugging

```bash
# Verbose output
npm test -- --verbose

# Clear cache
npm test -- --clearCache

# Debug in VS Code: Add Jest Debug configuration
```

## Contributing

When adding features:
1. Write tests first (TDD)
2. Maintain >80% coverage
3. Follow existing patterns
4. Run full suite before committing

---

**Stack**: Jest + ts-jest + ink-testing-library
