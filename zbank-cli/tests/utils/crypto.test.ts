import { describe, it, expect } from '@jest/globals';
import { hashPin, verifyPin } from '../../src/utils/crypto.js';

describe('crypto utilities', () => {
  describe('hashPin', () => {
    it('should hash a valid 4-digit PIN', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
      // Bcrypt hashes start with $2b$ or $2a$
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should produce different hashes for the same PIN (due to salt)', async () => {
      const pin = '1111';
      const hash1 = await hashPin(pin);
      const hash2 = await hashPin(pin);

      expect(hash1).not.toBe(hash2);
    });

    it('should reject invalid PIN format', async () => {
      await expect(hashPin('123')).rejects.toThrow('Invalid PIN format');
      await expect(hashPin('12345')).rejects.toThrow('Invalid PIN format');
      await expect(hashPin('abcd')).rejects.toThrow('Invalid PIN format');
    });
  });

  describe('verifyPin', () => {
    it('should verify correct PIN', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);

      const isValid = await verifyPin(pin, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect PIN', async () => {
      const pin = '1234';
      const hash = await hashPin(pin);

      const isValid = await verifyPin('5678', hash);
      expect(isValid).toBe(false);
    });

    it('should work with test account PINs', async () => {
      const pin1 = '1111';
      const hash1 = await hashPin(pin1);
      expect(await verifyPin('1111', hash1)).toBe(true);
      expect(await verifyPin('1112', hash1)).toBe(false);

      const pin2 = '1234';
      const hash2 = await hashPin(pin2);
      expect(await verifyPin('1234', hash2)).toBe(true);
      expect(await verifyPin('1235', hash2)).toBe(false);
    });
  });
});
