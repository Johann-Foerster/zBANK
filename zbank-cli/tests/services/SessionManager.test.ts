import { describe, it, expect, beforeEach } from '@jest/globals';
import { SessionManager } from '../../src/services/SessionManager.js';
import { Account } from '../../src/models/Account.js';

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  let testAccount: Account;

  beforeEach(() => {
    sessionManager = new SessionManager();
    testAccount = {
      accountNumber: '0000012345',
      pin: '$2b$10$abcdefghijklmnopqrstuv', // Mock bcrypt hash
      balance: 10000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  describe('setSession', () => {
    it('should set the current session with an account', () => {
      sessionManager.setSession(testAccount);
      
      const session = sessionManager.getSession();
      expect(session).toEqual(testAccount);
      expect(sessionManager.isSessionActive()).toBe(true);
    });

    it('should set the login time when session is created', () => {
      const beforeLogin = new Date();
      sessionManager.setSession(testAccount);
      const afterLogin = new Date();
      
      const loginTime = sessionManager.getLoginTime();
      expect(loginTime).not.toBeNull();
      expect(loginTime!.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
      expect(loginTime!.getTime()).toBeLessThanOrEqual(afterLogin.getTime());
    });

    it('should replace existing session when called multiple times', () => {
      const account1 = { ...testAccount, accountNumber: '1111111111' };
      const account2 = { ...testAccount, accountNumber: '2222222222' };
      
      sessionManager.setSession(account1);
      sessionManager.setSession(account2);
      
      const session = sessionManager.getSession();
      expect(session?.accountNumber).toBe('2222222222');
    });
  });

  describe('clearSession', () => {
    it('should clear the current session', () => {
      sessionManager.setSession(testAccount);
      sessionManager.clearSession();
      
      expect(sessionManager.getSession()).toBeNull();
      expect(sessionManager.isSessionActive()).toBe(false);
      expect(sessionManager.getLoginTime()).toBeNull();
    });

    it('should be safe to call when no session exists', () => {
      sessionManager.clearSession();
      expect(sessionManager.getSession()).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should return null when no session exists', () => {
      expect(sessionManager.getSession()).toBeNull();
    });

    it('should return the current account when session exists', () => {
      sessionManager.setSession(testAccount);
      const session = sessionManager.getSession();
      
      expect(session).toEqual(testAccount);
    });
  });

  describe('isSessionActive', () => {
    it('should return false when no session exists', () => {
      expect(sessionManager.isSessionActive()).toBe(false);
    });

    it('should return true when session exists', () => {
      sessionManager.setSession(testAccount);
      expect(sessionManager.isSessionActive()).toBe(true);
    });

    it('should return false after session is cleared', () => {
      sessionManager.setSession(testAccount);
      sessionManager.clearSession();
      expect(sessionManager.isSessionActive()).toBe(false);
    });
  });

  describe('getLoginTime', () => {
    it('should return null when no session exists', () => {
      expect(sessionManager.getLoginTime()).toBeNull();
    });

    it('should return login timestamp when session exists', () => {
      sessionManager.setSession(testAccount);
      const loginTime = sessionManager.getLoginTime();
      
      expect(loginTime).toBeInstanceOf(Date);
      expect(loginTime).not.toBeNull();
    });

    it('should return null after session is cleared', () => {
      sessionManager.setSession(testAccount);
      sessionManager.clearSession();
      expect(sessionManager.getLoginTime()).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update the session account when account numbers match', () => {
      sessionManager.setSession(testAccount);
      
      const updatedAccount = {
        ...testAccount,
        balance: 20000, // Changed balance
      };
      
      sessionManager.updateSession(updatedAccount);
      
      const session = sessionManager.getSession();
      expect(session?.balance).toBe(20000);
    });

    it('should not update session when account numbers do not match', () => {
      sessionManager.setSession(testAccount);
      
      const differentAccount = {
        ...testAccount,
        accountNumber: '9999999999',
        balance: 20000,
      };
      
      sessionManager.updateSession(differentAccount);
      
      const session = sessionManager.getSession();
      expect(session?.accountNumber).toBe('0000012345');
      expect(session?.balance).toBe(10000);
    });

    it('should be safe to call when no session exists', () => {
      sessionManager.updateSession(testAccount);
      expect(sessionManager.getSession()).toBeNull();
    });
  });
});
