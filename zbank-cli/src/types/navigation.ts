/**
 * Navigation types and enums for the zBANK CLI application
 * 
 * Implements state machine pattern similar to COBOL mainframe application:
 * - State 0: Login Screen (ZLOGIN)
 * - State 1: Home/Transaction Screen (ZHOME)
 * - State 2: Registration Screen (ZRGSTR)
 * - State 3: Exit Screen
 */

/**
 * Application navigation states
 * Maps to COBOL screen states (0, 1, 2)
 */
export enum AppState {
  LOGIN = 'LOGIN',
  HOME = 'HOME',
  REGISTER = 'REGISTER',
  EXIT = 'EXIT'
}

/**
 * Navigation context interface
 * Provides navigation methods to all components
 */
export interface NavigationContext {
  currentState: AppState;
  previousState: AppState | null;
  navigateTo: (state: AppState) => void;
  goBack: () => void;
}
