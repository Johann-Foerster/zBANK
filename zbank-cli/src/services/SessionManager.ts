import { Account } from '../models/Account.js';

/**
 * SessionManager handles user session state during application runtime
 *
 * This is similar to COBOL's VSAM record locking mechanism, but simpler.
 * The session persists only during the application runtime.
 */
export class SessionManager {
	private currentAccount: Account | null = null;
	private loginTime: Date | null = null;

	/**
	 * Set the current session with an authenticated account
	 * @param account - The authenticated account
	 */
	setSession(account: Account): void {
		this.currentAccount = account;
		this.loginTime = new Date();
	}

	/**
	 * Clear the current session (logout)
	 */
	clearSession(): void {
		this.currentAccount = null;
		this.loginTime = null;
	}

	/**
	 * Get the current session account
	 * @returns The current account or null if not authenticated
	 */
	getSession(): Account | null {
		return this.currentAccount;
	}

	/**
	 * Check if there is an active session
	 * @returns true if a user is logged in, false otherwise
	 */
	isSessionActive(): boolean {
		return this.currentAccount !== null;
	}

	/**
	 * Get the login time
	 * @returns The login timestamp or null if not logged in
	 */
	getLoginTime(): Date | null {
		return this.loginTime;
	}

	/**
	 * Update the session account (e.g., after balance changes)
	 * @param account - The updated account
	 */
	updateSession(account: Account): void {
		if (
			this.currentAccount &&
			this.currentAccount.accountNumber === account.accountNumber
		) {
			this.currentAccount = account;
		}
	}
}
