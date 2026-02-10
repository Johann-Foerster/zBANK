import { Account } from '../models/Account.js';
import { IStorage } from './IStorage.js';
import { SessionManager } from './SessionManager.js';
import { verifyPin } from '../utils/crypto.js';
import { isValidAccountNumber, isValidPin } from '../utils/validation.js';

/**
 * Result of an authentication attempt
 */
export interface AuthResult {
  success: boolean;
  account?: Account;
  error?: string;
}

/**
 * Authentication service interface
 * 
 * This service handles user login, logout, and session management.
 * Unlike the COBOL implementation, PINs are hashed for security.
 * 
 * MATCHING COBOL BEHAVIOR:
 * - No account lockout after failed attempts
 * - No brute-force protection
 * - No failed attempt tracking
 * - Simple PIN verification only
 */
export interface IAuthService {
  login(accountNumber: string, pin: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): Account | null;
  isAuthenticated(): boolean;
  changePin(oldPin: string, newPin: string): Promise<boolean>;
}

/**
 * AuthService implementation
 * 
 * Provides authentication functionality matching COBOL behavior
 * with the addition of PIN hashing for security.
 */
export class AuthService implements IAuthService {
  private storage: IStorage;
  private sessionManager: SessionManager;

  constructor(storage: IStorage, sessionManager: SessionManager) {
    this.storage = storage;
    this.sessionManager = sessionManager;
  }

  /**
   * Authenticate a user with account number and PIN
   * 
   * This mimics COBOL's login flow (State 0):
   * - Read account from storage (like VSAM READ UPDATE)
   * - Compare PIN with stored value
   * - If valid, create session (like setting SCREEN-STATE to 1)
   * 
   * @param accountNumber - 10-digit account number
   * @param pin - 4-digit PIN
   * @returns AuthResult with success status and account data or error
   */
  async login(accountNumber: string, pin: string): Promise<AuthResult> {
    // Validate input format
    if (!isValidAccountNumber(accountNumber)) {
      return {
        success: false,
        error: 'Invalid account number format. Must be 10 digits.',
      };
    }

    if (!isValidPin(pin)) {
      return {
        success: false,
        error: 'Invalid PIN format. Must be 4 digits.',
      };
    }

    try {
      // Get account from storage (like COBOL VSAM READ)
      const account = await this.storage.getAccount(accountNumber);

      if (!account) {
        return {
          success: false,
          error: 'Account not found',
        };
      }

      // Verify PIN (enhanced from COBOL's plain text comparison)
      const isValidPin = await verifyPin(pin, account.pin);

      if (!isValidPin) {
        // MATCHING COBOL: No failed attempt tracking
        // COBOL just rejects and stays on login screen
        return {
          success: false,
          error: 'Invalid PIN',
        };
      }

      // Create session (like COBOL setting SCREEN-STATE to 1)
      this.sessionManager.setSession(account);

      return {
        success: true,
        account,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Log out the current user
   * 
   * This mimics COBOL's quit operation:
   * - Unlock account (like VSAM UNLOCK)
   * - Return to login screen (State 0)
   */
  async logout(): Promise<void> {
    const currentUser = this.sessionManager.getSession();
    
    if (currentUser) {
      // Unlock account if it's locked (like COBOL UNLOCK)
      try {
        await this.storage.unlockAccount(currentUser.accountNumber);
      } catch {
        // Ignore unlock errors - session should be cleared anyway
      }
    }

    // Clear session (return to State 0)
    this.sessionManager.clearSession();
  }

  /**
   * Get the currently authenticated user
   * @returns The current account or null if not authenticated
   */
  getCurrentUser(): Account | null {
    return this.sessionManager.getSession();
  }

  /**
   * Check if a user is currently authenticated
   * @returns true if authenticated, false otherwise
   */
  isAuthenticated(): boolean {
    return this.sessionManager.isSessionActive();
  }

  /**
   * Change the PIN for the current user
   * 
   * Note: This functionality is not in the original COBOL application
   * but is included for completeness.
   * 
   * @param oldPin - Current PIN for verification
   * @param newPin - New PIN to set
   * @returns true if PIN changed successfully, false otherwise
   */
  async changePin(oldPin: string, newPin: string): Promise<boolean> {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return false;
    }

    // Validate new PIN format
    if (!isValidPin(newPin)) {
      return false;
    }

    try {
      // Verify old PIN
      const isValidOldPin = await verifyPin(oldPin, currentUser.pin);
      
      if (!isValidOldPin) {
        return false;
      }

      // Hash new PIN
      const { hashPin } = await import('../utils/crypto.js');
      const newHashedPin = await hashPin(newPin);

      // Update account with new PIN
      await this.storage.updateAccount(currentUser.accountNumber, {
        pin: newHashedPin,
      });

      // Update session with new account data
      const updatedAccount = await this.storage.getAccount(currentUser.accountNumber);
      if (updatedAccount) {
        this.sessionManager.updateSession(updatedAccount);
      }

      return true;
    } catch {
      return false;
    }
  }
}
