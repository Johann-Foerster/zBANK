import bcrypt from 'bcrypt';

/**
 * Validation utilities for zBANK CLI
 */

/**
 * Validate account number format
 * @param accountNumber - The account number to validate
 * @returns true if valid, false otherwise
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  return /^\d{10}$/.test(accountNumber);
}

/**
 * Validate PIN format (4 digits for user input)
 * @param pin - The PIN to validate
 * @returns true if valid, false otherwise
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/**
 * Validate amount (must be positive number)
 * @param amount - The amount in cents
 * @returns true if valid, false otherwise
 */
export function isValidAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount > 0;
}

/**
 * Hash a PIN using bcrypt
 * @param pin - The plain text PIN (4 digits)
 * @returns Promise resolving to hashed PIN
 */
export async function hashPin(pin: string): Promise<string> {
  if (!isValidPin(pin)) {
    throw new Error('Invalid PIN format. Must be 4 digits.');
  }
  
  const saltRounds = 10;
  return await bcrypt.hash(pin, saltRounds);
}

/**
 * Compare a plain text PIN with a hashed PIN
 * @param pin - The plain text PIN
 * @param hashedPin - The hashed PIN to compare against
 * @returns Promise resolving to true if match, false otherwise
 */
export async function comparePin(pin: string, hashedPin: string): Promise<boolean> {
  return await bcrypt.compare(pin, hashedPin);
}

/**
 * Format dollars to cents
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * Format cents to dollars
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Format cents as currency string
 * @param cents - Amount in cents
 * @returns Formatted currency string (e.g., "$100.00")
 */
export function formatCurrency(cents: number): string {
  const dollars = centsToDollars(cents);
  return `$${dollars.toFixed(2)}`;
}

/**
 * Sanitize input by removing non-numeric characters
 * @param input - The input string
 * @returns Sanitized string with only digits
 */
export function sanitizeNumericInput(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Pad account number to 10 digits with leading zeros
 * @param accountNumber - The account number (may be less than 10 digits)
 * @returns Padded account number
 */
export function padAccountNumber(accountNumber: string): string {
  return accountNumber.padStart(10, '0');
}

/**
 * Pad PIN to 10 digits with leading zeros (for COBOL compatibility)
 * Note: This is only used for migration from COBOL data
 * @param pin - The PIN (4 digits)
 * @returns Padded PIN (10 digits)
 */
export function padPinForCobol(pin: string): string {
  return pin.padStart(10, '0');
}
