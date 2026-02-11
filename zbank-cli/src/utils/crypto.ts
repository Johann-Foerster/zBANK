import {
	hashPin as hashPinInternal,
	comparePin as comparePinInternal,
} from './validation.js';

/**
 * Crypto utilities for zBANK CLI
 *
 * This module provides PIN hashing and verification functionality
 * as specified in Task 03. It wraps the validation utilities to
 * provide a dedicated crypto interface.
 */

/**
 * Hash a PIN using bcrypt
 * @param pin - The plain text PIN (4 digits)
 * @returns Promise resolving to hashed PIN
 * @throws Error if PIN format is invalid
 */
export async function hashPin(pin: string): Promise<string> {
	return hashPinInternal(pin);
}

/**
 * Verify a PIN against a hashed value
 * @param pin - The plain text PIN (4 digits)
 * @param hash - The bcrypt hash to verify against
 * @returns Promise resolving to true if PIN matches, false otherwise
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
	return comparePinInternal(pin, hash);
}
