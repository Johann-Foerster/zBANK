# zBANK - COBOL Banking Application Overview

## Executive Summary

**zBANK** is a mainframe banking application developed as an Enterprise Mainframe Computing project. It demonstrates a complete transaction processing system using classic IBM mainframe technologies: COBOL programming language, CICS (Customer Information Control System) transaction processing, BMS (Basic Mapping Support) for screen management, and VSAM (Virtual Storage Access Method) for persistent data storage.

The application simulates a simple banking system where users can:
- Authenticate with account number and PIN
- View their account balance
- Perform deposits and withdrawals
- Register new accounts (partial implementation)

---

## System Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Programming Language** | COBOL | Business logic implementation |
| **Transaction Monitor** | CICS (DFH530) | Online transaction processing and resource management |
| **User Interface** | BMS (Basic Mapping Support) | Terminal screen definition and management |
| **Data Storage** | VSAM KSDS | Persistent storage for account data |
| **Build System** | JCL (Job Control Language) | Compilation, linking, and resource definition |

### Architectural Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Terminal (3270)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    CICS Transaction: ZBNK                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          BMS Maps (ZBANKSET Mapset)                  │   │
│  │  • ZLOGIN  (Login Screen)                            │   │
│  │  • ZHOME   (Home/Transaction Screen)                 │   │
│  │  • ZRGSTR  (Registration Screen)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│                            ▼                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          COBOL Program: ZBANK3                       │   │
│  │  • State Machine (Login → Home → Register)           │   │
│  │  • Transaction Processing (Deposit/Withdraw)         │   │
│  │  • PIN Validation                                    │   │
│  │  • Balance Management                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              VSAM File: VSAMZBNK (U0210.VSAM.ZBANK)         │
│  • Type: Key-Sequenced Data Set (KSDS)                      │
│  • Record Size: 30 bytes                                     │
│  • Key: Account Number (10 bytes)                           │
│  • Structure: ACCNO(10) + PIN(10) + BALANCE(10)             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Inventory

### Main Application Files

#### 1. **CICS.COB_ZBANK3_.cbl** (Main Program)
**Purpose:** Core banking application logic  
**Lines of Code:** ~141 lines  
**Language:** COBOL with CICS commands

**Key Components:**
- **WORKING-STORAGE SECTION:**
  - File record structure (30 bytes: account, PIN, balance)
  - Screen state management (0=Login, 1=Home, 2=Register)
  - User input variables
  - VSAM file control variables

- **PROCEDURE DIVISION:**
  - State machine implementation with infinite loop
  - Login authentication logic
  - Transaction processing (deposits, withdrawals)
  - Screen navigation and display logic
  - VSAM file operations (READ UPDATE, REWRITE, UNLOCK)

**Data Structure:**
User PINs are entered as fixed 4-digit values in the UI but are stored as zero-padded 10-digit numeric fields in the VSAM record.
```cobol
WS-FILE-REC (30 bytes total):
├─ WS-ACCNO    PIC 9(10)  [Account Number - 10 bytes]
├─ WS-PIN      PIC 9(10)  [PIN Code - stored as 10-digit zero-padded numeric; UI accepts 4-digit PIN]
└─ WS-BALANCE  PIC 9(10)  [Balance - 10 bytes]
```

**Program Flow:**
```
START → Initialize Screen State (0)
  │
  ├─ State 0 (Login):
  │    ├─ Display ZLOGIN map
  │    ├─ Read account/PIN input
  │    ├─ READ VSAM record with UPDATE lock
  │    ├─ Validate PIN
  │    └─ Transition to State 1 (Home) if valid
  │
  ├─ State 1 (Home):
  │    ├─ Display ZHOME map with balance
  │    ├─ Accept transaction action:
  │    │   ├─ D (Deposit): Add to balance → REWRITE
  │    │   ├─ W (Withdraw): Subtract from balance → REWRITE
  │    │   ├─ T (Transfer): Not implemented
  │    │   └─ Q (Quit): Return to State 0
  │    └─ Loop
  │
  └─ State 2 (Register):
       ├─ Display ZRGSTR map
       ├─ Accept Q to return to State 0
       └─ (Full registration not implemented)
```

---

### BMS Map Definitions

#### 2. **CICS.JCL_ZMAPSET_.cbl** (BMS Mapset)
**Purpose:** Screen layout definitions for user interface  
**Mapset Name:** ZBNKSET  
**Type:** MAP, MODE=INOUT, LANG=COBOL2

**Three Maps Defined:**

##### **Map 1: ZLOGIN** (Login Screen)
- **Size:** 24x80 characters
- **Fields:**
  - Title: "ZBANK LOGIN" (centered)
  - ASCII art logo (zBank branding)
  - `LOGINFO`: Information/error message area (50 chars)
  - `LOGACC`: Account number input (10 numeric digits, unprotected input field)
  - `LOGPIN`: PIN input (4 numeric digits, unprotected input field)
  - `LOGACT`: Action selector (Q=Exit, R=Register)
- **Attributes:** FREEKB (keyboard unlocked), UNPROT (unprotected input), NUM (numeric only)

##### **Map 2: ZHOME** (Home/Transaction Screen)
- **Size:** 24x80 characters
- **Fields:**
  - Title: "ZBANK HOME"
  - ASCII art logo
  - `HOMINFO`: Information/error message area (50 chars)
  - `BALANCE`: Current balance display (10 digits, skip protected)
  - `AMOUNT`: Transaction amount input (10 numeric digits)
  - `HOMACT`: Action selector (Q=Exit, D=Deposit, W=Withdraw, T=Transfer)
- **Initial Cursor:** Set to AMOUNT field (IC attribute)

##### **Map 3: ZRGSTR** (Registration Screen)
- **Size:** 24x80 characters
- **Fields:**
  - Title: "ZBANK REGISTER"
  - ASCII art logo
  - `REGINFO`: Information/error message area (50 chars)
  - `REGACC`: Account number input (10 numeric digits)
  - `REGPIN`: PIN input (4 numeric digits)
  - `REGACT`: Action selector (Q=Back)
- **Status:** Skeleton only - full functionality not implemented

**Common Design Elements:**
- Consistent branding with ASCII art "zBank" logo on all screens
- 50-character information/message area for user feedback
- FREEKB control option enables keyboard input
- Numeric-only fields enforce data validation at screen level

---

### JCL Job Control Files

#### 3. **CICS.JCL_PPCOMLNK_.cbl** (Compile and Link)
**Purpose:** Compiles COBOL source and links into CICS load library  
**Job Name:** PPCOMLNK  

**Process:**
1. Uses DFHZITCL procedure for CICS COBOL compilation
2. COBOL compiler: IGY520 (Enterprise COBOL for z/OS)
3. Input source: `U0210.CICS.COB(ZBANK3)`
4. Output load module: `U0210.CICS.LOADLIB(ZBANK)`
5. Link-edit with CICS libraries: `DFH530.CICS.SDFHCOB`
6. Creates reentrant program module (`NAME ZBANK(R)`)

#### 4. **CICS.JCL_VSAMSET_.cbl** (VSAM Cluster Definition)
**Purpose:** Defines VSAM Key-Sequenced Data Set (KSDS) for account data  
**Job Name:** VSAMZB  
**Utility:** IDCAMS (Access Method Services)

**Cluster Specifications:**
```
DEFINE CLUSTER:
  Name: U0210.VSAM.ZBANK
  Volume: B2SYS1
  Organization: INDEXED (KSDS)
  Record Size: 30 bytes (fixed)
  Space Allocation: 1 track primary, 1 track secondary
  Key Definition:
    - Length: 10 bytes
    - Offset: 0 (starts at beginning of record)
  
  Data Component: U0210.VSAM.ZBANK.DATA
  Index Component: U0210.VSAM.ZBANK.INDEX
```

**Key Features:**
- Fixed-length 30-byte records
- Key field is account number (first 10 bytes)
- Indexed organization for fast random access
- Minimal space allocation suitable for demonstration

#### 5. **CICS.JCL_COPY2VSM_.cbl** (Data Load)
**Purpose:** Loads initial account data from sequential file into VSAM  
**Job Name:** COPYSEQ  
**Utility:** IDCAMS REPRO command

**Process:**
1. Input: Sequential dataset `U0210.SEQDAT.ZBANK`
2. Output: VSAM cluster `U0210.VSAM.ZBANK`
3. Operation: REPRO (sequential to VSAM copy)

**Initial Data Loaded:**
```
Record 1: Account=0000012345, PIN=0000001111, Balance=0000000100
Record 2: Account=1234567890, PIN=0000001234, Balance=0000000200
```

---

### Data Files

#### 6. **SEQDAT.ZBANK.cbl** (Initial Data)
**Purpose:** Sequential dataset containing seed account data  
**Format:** Fixed 30-byte records

**Data Content:**
| Account Number | PIN        | Balance    | Description |
|---------------|------------|------------|-------------|
| 0000012345    | 0000001111 | 0000000100 | Test account 1: $100 initial balance |
| 1234567890    | 0000001234 | 0000000200 | Test account 2: $200 initial balance |

**Record Layout:**
```
Position 1-10:  Account Number (numeric, right-justified with leading zeros)
Position 11-20: PIN Code (numeric, right-justified with leading zeros)
Position 21-30: Balance in cents (numeric, e.g., 100 = $1.00)
```

---

### Installation Files

#### 7. **CICS_install.cbl** (CICS Resource Definitions)
**Purpose:** CICS resource definition and installation commands  
**Interface:** CEDA (CICS Resource Definition)

**Installation Steps:**

**Phase 1: BMS Mapset Installation**
```
CEDA DEFINE MAPSET(ZBANKSET) GROUP(ZBANK)
CEDA INSTALL MAPSET(ZBANKSET) GROUP(ZBANK)
```

**Phase 2: Transaction and Program Installation**
```
CEDA DEFINE TRANSACTION(ZBNK) PROGRAM(ZBANK) GROUP(ZBANK)
CEDA DEFINE PROGRAM(ZBANK) GROUP(ZBANK)
CEDA DEFINE LIBRARY(ZLOAD) GROUP(ZBANK) DSNAME01(U0210.CICS.LOADLIB)
CEDA INSTALL TRANSACTION(ZBNK) GROUP(ZBANK)
CEDA INSTALL PROGRAM(ZBANK) GROUP(ZBANK)
CEDA INSTALL LIBRARY(ZLOAD) GROUP(ZBANK)
```

**Phase 3: VSAM File Installation**
```
CEMT SET FILE(VSAMZBNK) FORCECLOSE
CEDA DELETE FILE(VSAMZBNK) GROUP(ZBANK)
CEDA DEFINE FILE(VSAMZBNK) GROUP(ZBANK) DSNAME(U0210.VSAM.ZBANK) UPDATE(YES)
CEDA INSTALL FILE(VSAMZBNK) GROUP(ZBANK)
```

**Resource Group:** All resources defined under ZBANK group for easy management

**Important Notes:**
- File permissions must be set to allow Browse, Add, Delete, Update
- Transaction ID `ZBNK` invokes program `ZBANK`
- Load library must be defined before program installation

---

## Business Logic and Transaction Processing

### State Machine Model

The application operates as a state machine with three distinct states:

```
┌─────────────────────────────────────────────────────────────┐
│                      SCREEN-STATE = 0                        │
│                      (LOGIN STATE)                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Display ZLOGIN map                                  │ │
│  │ 2. Receive account number and PIN                      │ │
│  │ 3. Read VSAM record with UPDATE lock                   │ │
│  │ 4. Validate PIN against stored value                   │ │
│  │ 5. On success → SCREEN-STATE = 1                       │ │
│  │    On failure → Display error message                  │ │
│  │ 6. Action 'R' → SCREEN-STATE = 2 (Register)            │ │
│  │ 7. Action 'Q' → EXIT-CONDITION = 1 (Quit)              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      SCREEN-STATE = 1                        │
│                      (HOME/TRANSACTION STATE)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Display ZHOME map with current balance              │ │
│  │ 2. Receive action and amount                           │ │
│  │ 3. Process action:                                     │ │
│  │    ├─ 'D' (Deposit): BALANCE = BALANCE + AMOUNT        │ │
│  │    ├─ 'W' (Withdraw): BALANCE = BALANCE - AMOUNT       │ │
│  │    ├─ 'T' (Transfer): Not implemented                  │ │
│  │    └─ 'Q' (Quit): SCREEN-STATE = 0, UNLOCK record      │ │
│  │ 4. REWRITE VSAM record with new balance                │ │
│  │ 5. Display updated balance                             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      SCREEN-STATE = 2                        │
│                      (REGISTRATION STATE)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Display ZRGSTR map                                  │ │
│  │ 2. Accept input (incomplete implementation)            │ │
│  │ 3. Action 'Q' → SCREEN-STATE = 0                       │ │
│  │ 4. Full registration logic not implemented             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Transaction Types

#### **Deposit Transaction (Action 'D')**
```cobol
Process:
1. User enters amount in AMOUNT field
2. User enters 'D' in action field
3. Program adds AMOUNT to WS-BALANCE
4. Program executes REWRITE DATASET(WS-FILE-NAME) FROM(WS-FILE-REC)
5. Updated balance displays on screen
6. User remains in HOME state for additional transactions
```

**Example:**
- Starting Balance: $100.00 (0000100000)
- Deposit Amount: $50.00 (0000050000)
- New Balance: $150.00 (0000150000)

#### **Withdrawal Transaction (Action 'W')**
```cobol
Process:
1. User enters amount in AMOUNT field
2. User enters 'W' in action field
3. Program subtracts AMOUNT from WS-BALANCE
4. Program executes REWRITE DATASET(WS-FILE-NAME) FROM(WS-FILE-REC)
5. Updated balance displays on screen
6. User remains in HOME state for additional transactions
```

**Example:**
- Starting Balance: $100 (0000000100)
- Withdrawal Amount: $30 (0000000030)
- New Balance: $70 (0000000070)

**Note:** No validation for negative balance (overdraft protection not implemented)

#### **Transfer Transaction (Action 'T')**
**Status:** Placeholder only - Not implemented  
**Intended Purpose:** Transfer funds between accounts

#### **Quit Transaction (Action 'Q')**
```cobol
Process:
1. User enters 'Q' in action field
2. Program executes UNLOCK DATASET(WS-FILE-NAME)
3. SCREEN-STATE reset to 0 (Login)
4. Session returns to login screen
```

### VSAM File Operations

#### **READ with UPDATE Lock**
```cobol
EXEC CICS READ
    DATASET(WS-FILE-NAME)      /* 'VSAMZBNK' */
    INTO(WS-FILE-REC)           /* 30-byte record buffer */
    RIDFLD(ACCNO)               /* Account number key */
    KEYLENGTH(10)               /* Key is 10 bytes */
    UPDATE                      /* Lock record for update */
    RESP(WS-RESP-CODE)          /* Response code */
END-EXEC
```
- **Purpose:** Locks record during user session to prevent concurrent updates
- **Locking:** Record remains locked until REWRITE or UNLOCK
- **Key Access:** Direct access by account number (KSDS key)

#### **REWRITE (Update Record)**
```cobol
EXEC CICS REWRITE
    DATASET(WS-FILE-NAME)       /* 'VSAMZBNK' */
    FROM(WS-FILE-REC)           /* Updated 30-byte record */
    RESP(WS-RESP-CODE)          /* Response code */
END-EXEC
```
- **Purpose:** Commits balance changes to VSAM file
- **Execution:** After deposit or withdrawal
- **Implicit:** Releases record lock

#### **UNLOCK (Release Lock)**
```cobol
EXEC CICS UNLOCK
    DATASET(WS-FILE-NAME)       /* 'VSAMZBNK' */
END-EXEC
```
- **Purpose:** Releases record lock without updating
- **Usage:** When user logs out (Action 'Q')

---

## Security Considerations

### Authentication Mechanism
- **Two-factor:** Account number + PIN
- **PIN Storage:** Plain text in VSAM (NOT SECURE for production)
- **PIN Length (UI):** User must enter a fixed 4-digit PIN (weak security)
- **PIN Storage Format:** Stored as a 10-digit, zero-padded numeric field in VSAM (e.g., UI PIN `1111` is stored as `0000001111`)
- **Validation:** Simple numeric comparison

### Identified Security Issues

1. **No PIN Encryption:**
   - PINs stored in plain text in VSAM file
   - Vulnerable to unauthorized access if file permissions compromised
   - **Recommendation:** Implement one-way hashing (e.g., SHA-256)

2. **No Account Lockout:**
   - Unlimited login attempts allowed
   - Susceptible to brute-force attacks
   - **Recommendation:** Implement attempt counter and temporary lockout

3. **No Overdraft Protection:**
   - Withdrawals can result in negative balances
   - No validation of sufficient funds
   - **Recommendation:** Add balance validation before withdrawal

4. **No Transaction Logging:**
   - No audit trail of deposits/withdrawals
   - Cannot track unauthorized transactions
   - **Recommendation:** Implement transaction log file

5. **Session Management:**
   - Record lock persists during entire session
   - Potential for deadlocks if terminal disconnects
   - **Recommendation:** Implement timeout mechanism

6. **No Multi-user Protection:**
   - Basic record locking only
   - No timestamp or version checking
   - **Recommendation:** Add optimistic locking with version numbers

---

## Implementation Status

### Completed Features ✅
- [x] User login with account/PIN authentication
- [x] Account balance display
- [x] Deposit transactions
- [x] Withdrawal transactions
- [x] VSAM file READ/WRITE operations
- [x] Screen navigation (Login ↔ Home)
- [x] BMS map definitions for all screens
- [x] CICS transaction setup
- [x] Initial data loading

### Partially Implemented Features ⚠️
- [~] Registration screen (UI exists, logic incomplete)
- [~] Transfer transactions (menu option exists, not implemented)

### Missing Features / Enhancements ❌
- [ ] New account creation (WRITE to VSAM)
- [ ] Account-to-account transfers
- [ ] Transaction history
- [ ] Overdraft protection
- [ ] PIN encryption
- [ ] Account lockout after failed attempts
- [ ] Session timeout
- [ ] Transaction logging/audit trail
- [ ] Multi-currency support
- [ ] Interest calculation
- [ ] Account types (checking, savings)

---

## Deployment and Installation Guide

### Prerequisites
- IBM z/OS operating system
- CICS Transaction Server (DFH530 or compatible)
- VSAM support
- Enterprise COBOL compiler (IGY520 or compatible)
- User ID: U0210 (or modify dataset names)

### Installation Steps

#### Step 1: Allocate and Define VSAM Cluster
```jcl
Submit: CICS.JCL_VSAMSET_.cbl
Purpose: Creates VSAM KSDS cluster
Verify: Check job output for successful DEFINE CLUSTER
```

#### Step 2: Load Initial Account Data
```jcl
Submit: CICS.JCL_COPY2VSM_.cbl
Purpose: Loads test accounts into VSAM
Verify: Use IDCAMS PRINT to view records
```

#### Step 3: Compile and Link COBOL Program
```jcl
Submit: CICS.JCL_PPCOMLNK_.cbl
Purpose: Compiles ZBANK3 source into load module
Verify: Check for clean compile (RC=0) and load module in U0210.CICS.LOADLIB
```

#### Step 4: Assemble BMS Mapset
```jcl
Submit: CICS.JCL_ZMAPSET_.cbl
Purpose: Assembles ZBNKSET mapset for CICS
Verify: Mapset object in DFH530.CICS.SDFHLOAD
```

#### Step 5: Define CICS Resources
```
Execute CICS_install.cbl commands in CICS region:
1. Define and install MAPSET(ZBANKSET)
2. Define and install TRANSACTION(ZBNK), PROGRAM(ZBANK), LIBRARY(ZLOAD)
3. Define and install FILE(VSAMZBNK) with UPDATE=YES
Verify: CEMT I TRANSACTION(ZBNK) shows enabled
```

#### Step 6: Test the Application
```
1. From CICS terminal, enter transaction: ZBNK
2. Login screen should appear
3. Test with account: 0000012345, PIN: 1111
4. Perform deposit/withdrawal transactions
5. Verify balance updates correctly
```

---

## Testing Scenarios

### Test Case 1: Successful Login
```
Input:
  Account: 0000012345
  PIN: 1111
Expected:
  → Navigate to HOME screen
  → Display balance: 0000000100
```

### Test Case 2: Failed Login (Invalid PIN)
```
Input:
  Account: 0000012345
  PIN: 9999
Expected:
  → Remain on LOGIN screen
  → Display error message
```

### Test Case 3: Deposit Transaction
```
Precondition: Logged in, balance = 100
Input:
  Amount: 0000000050
  Action: D
Expected:
  → Balance updates to 0000000150
  → VSAM record updated
  → Remain on HOME screen
```

### Test Case 4: Withdrawal Transaction
```
Precondition: Logged in, balance = 100
Input:
  Amount: 0000000030
  Action: W
Expected:
  → Balance updates to 0000000070
  → VSAM record updated
  → Remain on HOME screen
```

### Test Case 5: Logout
```
Precondition: Logged in
Input:
  Action: Q
Expected:
  → Record unlocked in VSAM
  → Return to LOGIN screen
  → SCREEN-STATE = 0
```

---

## Project Structure Summary

```
zBANK/
├── CICS.COB_ZBANK3_.cbl         # Main COBOL application (141 lines)
│   └── Core banking logic, state machine, transaction processing
│
├── CICS.JCL_ZMAPSET_.cbl        # BMS mapset definitions (94 lines)
│   ├── ZLOGIN  (Login screen)
│   ├── ZHOME   (Transaction screen)
│   └── ZRGSTR  (Registration screen)
│
├── CICS.JCL_PPCOMLNK_.cbl       # Compile/link JCL (9 lines)
│   └── Builds ZBANK load module
│
├── CICS.JCL_VSAMSET_.cbl        # VSAM definition JCL (12 lines)
│   └── Creates KSDS cluster
│
├── CICS.JCL_COPY2VSM_.cbl       # Data load JCL (12 lines)
│   └── Populates VSAM with test data
│
├── SEQDAT.ZBANK.cbl             # Initial data file (2 records)
│   ├── Account: 0000012345, Balance: 100
│   └── Account: 1234567890, Balance: 200
│
├── CICS_install.cbl             # CICS resource definitions (18 lines)
│   ├── Mapset installation
│   ├── Transaction/program setup
│   └── File definitions
│
├── README.md                    # Project documentation
│   └── Overview, screenshots, file descriptions
│
└── img/                         # Screenshots and diagrams
    ├── logo.png
    ├── ZBankSetup.png
    ├── zbank1.png
    ├── zbank2.png
    ├── zbank3.png
    └── zbank4.png
```

**Total Lines of Code:** ~288 lines across all source files  
**Primary Language:** COBOL (95%), JCL (5%)

---

## Technical Specifications

### VSAM File Specifications
| Attribute | Value |
|-----------|-------|
| **Dataset Name** | U0210.VSAM.ZBANK |
| **Organization** | KSDS (Key-Sequenced Data Set) |
| **Record Format** | Fixed Block |
| **Record Length** | 30 bytes |
| **Key Position** | 0 (offset from start) |
| **Key Length** | 10 bytes |
| **Key Field** | Account Number |
| **Space Allocation** | Primary: 1 track, Secondary: 1 track |
| **Volume** | B2SYS1 |

### CICS Transaction Specifications
| Attribute | Value |
|-----------|-------|
| **Transaction ID** | ZBNK |
| **Program Name** | ZBANK |
| **Resource Group** | ZBANK |
| **Transaction Type** | Conversational |
| **Load Library** | U0210.CICS.LOADLIB |
| **CICS Version** | DFH530 |

### BMS Mapset Specifications
| Attribute | Value |
|-----------|-------|
| **Mapset Name** | ZBNKSET |
| **Language** | COBOL2 |
| **Mode** | INOUT (Input/Output) |
| **Type** | MAP |
| **Storage** | AUTO |
| **TIOAPFX** | YES |
| **Screen Size** | 24 rows x 80 columns |
| **Number of Maps** | 3 (ZLOGIN, ZHOME, ZRGSTR) |

---

## Development Team

**Authors:**
- Benjamin Linnik
- Nicklas V.
- Henrik G.

**Academic Context:**  
Enterprise Mainframe Computing Course Project

**Institution:** (Not specified in source)

---

## Conclusion

The zBANK application successfully demonstrates fundamental mainframe transaction processing concepts:

✅ **Strengths:**
- Clean COBOL code structure with logical separation
- Proper use of CICS commands and BMS screens
- Effective state machine implementation
- Working VSAM file integration
- Complete build and deployment automation via JCL

⚠️ **Areas for Improvement:**
- Security enhancements (PIN encryption, input validation)
- Complete registration functionality
- Implement transfer transactions
- Add transaction history and audit logging
- Improve error handling and user feedback
- Add business logic validations (overdraft protection)

🎯 **Educational Value:**
- Excellent learning project for mainframe development
- Demonstrates integration of multiple z/OS technologies
- Provides hands-on experience with COBOL, CICS, BMS, and VSAM
- Realistic banking domain application

The codebase serves as a solid foundation for understanding enterprise mainframe application architecture and could be extended with additional features to create a more production-ready system.

---

## Appendix: Quick Reference

### Command Summary
```
Start Application:     ZBNK
Login Test Account:    0000012345 / PIN: 1111
Deposit:              D + Amount
Withdraw:             W + Amount
Logout:               Q
Register (partial):    R from login screen
```

### Dataset Names
```
COBOL Source:      U0210.CICS.COB(ZBANK3)
Load Module:       U0210.CICS.LOADLIB(ZBANK)
VSAM File:         U0210.VSAM.ZBANK
Sequential Data:   U0210.SEQDAT.ZBANK
CICS Libraries:    DFH530.CICS.*
```

### Resource Names
```
Transaction:       ZBNK
Program:           ZBANK
Mapset:            ZBNKSET
VSAM File:         VSAMZBNK
Group:             ZBANK
```

---

*Document Generated: Analysis of zBANK COBOL Banking Application*  
*Last Updated: February 2026*
