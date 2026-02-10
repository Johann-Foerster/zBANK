---
applyTo:
  - "*.cbl"
  - "*.CBL"
  - "*.cob"
  - "*.COB"
---

# COBOL Mainframe Code Instructions

## Overview
These files represent a legacy mainframe banking application using IBM technologies:
- **COBOL**: Business logic programming language
- **CICS**: Transaction processing monitor
- **BMS**: Screen management system
- **VSAM**: Data storage system

## Code Conventions

### COBOL Syntax
- Follow traditional COBOL column formatting (columns 1-6 for sequence, 7 for indicator, 8-72 for code)
- Use ALL-CAPS for COBOL reserved words and data names (maintaining existing style)
- Use meaningful data names following established patterns (WS- prefix for working storage, etc.)

### Data Definitions
- Working Storage Section: Define all program variables here
- Use PIC clauses that match existing patterns (PIC 9(10) for numeric fields, PIC X(n) for alphanumeric)
- Maintain fixed-length records (30 bytes for VSAM records in this application)

### CICS Commands
- All CICS commands must be properly enclosed in EXEC CICS ... END-EXEC blocks
- Handle response codes with RESP() parameter for error handling
- Use proper CICS file operations: READ UPDATE, REWRITE, UNLOCK

### BMS Screen Definitions
- Map definitions use DFHMSD macro for mapset, DFHMDI for individual maps, DFHMDF for fields
- Screen size is 24x80 characters
- Use consistent field naming (three-letter prefix based on map name)
- Maintain FREEKB attribute for keyboard unlocked state

## File Relationships

### Main Files
- **CICS.COB_ZBANK3_.cbl**: Main banking application program
- **CICS.JCL_ZMAPSET_.cbl**: BMS screen definitions (ZLOGIN, ZHOME, ZRGSTR maps)
- **CICS.JCL_PPCOMLNK_.cbl**: Compilation and link-edit JCL
- **CICS.JCL_VSAMSET_.cbl**: VSAM file definition JCL
- **CICS.JCL_COPY2VSM_.cbl**: Data loading JCL
- **SEQDAT.ZBANK.cbl**: Initial account data
- **CICS_install.cbl**: CICS resource definitions

## Data Structure
The VSAM file uses fixed 30-byte records:
```
Positions 1-10:  Account Number (PIC 9(10))
Positions 11-20: PIN Code (PIC 9(10)) - stored as zero-padded 10 digits
Positions 21-30: Balance (PIC 9(10)) - whole dollar amounts
```

**Important**: PINs are entered as 4 digits in the UI but stored as 10-digit zero-padded values in VSAM.
Example: User enters `1111`, stored as `0000001111`

## State Machine
The application uses a state-based navigation:
- State 0: Login screen (ZLOGIN)
- State 1: Home/Transaction screen (ZHOME)
- State 2: Registration screen (ZRGSTR) - partially implemented

## Transaction Processing
- **Deposits (D)**: Add amount to balance, REWRITE record
- **Withdrawals (W)**: Subtract amount from balance, REWRITE record
- **Quit (Q)**: UNLOCK record, return to login
- **Transfer (T)**: Not implemented

## Security Considerations
**WARNING**: This is an educational project. The current implementation has security issues:
- PINs stored in plain text (not encrypted)
- No overdraft protection
- No transaction logging
- No account lockout after failed attempts

When making changes, be aware of these limitations but maintain the educational nature of the codebase.

## Testing
- Changes to COBOL code require mainframe environment for compilation
- JCL scripts document the build and deployment process
- Test accounts:
  - Account: 0000012345, PIN: 1111 (stored as 0000001111), Balance: $100
  - Account: 1234567890, PIN: 1234 (stored as 0000001234), Balance: $200

## Modifications Guidelines
- **Preserve existing functionality**: This is a working demonstration system
- **Minimal changes**: Only modify when specifically required
- **Maintain formatting**: Keep COBOL column formatting and style
- **Document changes**: Update comments if adding new functionality
- **Test thoroughly**: Any VSAM or CICS changes could break the application

## Common Operations

### Adding a New Screen
1. Define map in CICS.JCL_ZMAPSET_.cbl using DFHMDI/DFHMDF macros
2. Add state logic in CICS.COB_ZBANK3_.cbl
3. Update state machine transitions
4. Rebuild mapset with appropriate JCL

### Modifying VSAM Record Structure
1. Update WS-FILE-REC in working storage
2. Modify VSAM cluster definition in CICS.JCL_VSAMSET_.cbl
3. Update initial data in SEQDAT.ZBANK.cbl
4. Recreate VSAM file and reload data

## Build Process
1. Compile COBOL: Submit CICS.JCL_PPCOMLNK_.cbl
2. Assemble BMS: Submit CICS.JCL_ZMAPSET_.cbl
3. Define VSAM: Submit CICS.JCL_VSAMSET_.cbl
4. Load data: Submit CICS.JCL_COPY2VSM_.cbl
5. Install resources: Execute commands in CICS_install.cbl

## References
- See docs/overview.md for complete technical documentation
- CICS commands reference: IBM CICS documentation
- COBOL syntax: Enterprise COBOL for z/OS Language Reference
