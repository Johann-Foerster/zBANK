---
applyTo:
  - "**/*.md"
  - "docs/**"
---

# Documentation Instructions

## Overview
Documentation is critical for this project as it bridges legacy mainframe technology with modern development. Clear, accurate documentation helps developers understand both the COBOL heritage and the TypeScript modernization.

## Documentation Files

### Repository Root
- **README.md**: Main project overview, should provide quick introduction and navigation
- **docs/overview.md**: Comprehensive technical documentation of the COBOL application

### Component Documentation
- **zbank-cli/README.md**: TypeScript CLI project documentation
- **tasks/**: Task-specific documentation and requirements

## Writing Style

### General Guidelines
- Write clearly and concisely
- Use active voice
- Define technical terms on first use
- Include code examples where helpful
- Keep documentation up-to-date with code changes

### Formatting
- Use proper Markdown syntax
- Use headings to organize content hierarchically
- Use code blocks with language identifiers (```typescript, ```cobol, ```bash)
- Use tables for structured data
- Use lists for sequential steps or items
- Include diagrams and images in `img/` directory

### Code Examples
```markdown
\`\`\`typescript
// Good: Include language identifier and context
const accountBalance = 1000;
console.log(`Balance: $${accountBalance}`);
\`\`\`
```

### Technical Terminology
- **COBOL terms**: Define mainframe-specific terms (CICS, BMS, VSAM, JCL, etc.)
- **Modern terms**: Explain TypeScript/React terms when they relate to COBOL concepts
- **Banking terms**: Clarify banking operations and concepts
- **Acronyms**: Spell out on first use, then use acronym

## Structure Guidelines

### README Files
Include these sections in order:
1. **Title**: Clear project/component name
2. **Overview**: Brief description of purpose and functionality
3. **Features**: Key capabilities (bullet list)
4. **Prerequisites**: Required software, versions, environment
5. **Installation**: Step-by-step setup instructions
6. **Usage**: How to run/use the component
7. **Development**: Development workflow and commands
8. **Project Structure**: Directory layout and file descriptions
9. **Contributing**: Guidelines for contributors (if applicable)
10. **License**: License information

### Technical Documentation (docs/overview.md)
For detailed technical docs, include:
- Executive summary
- System architecture with diagrams
- File inventory with descriptions
- Business logic explanation
- Data structures and formats
- Installation/deployment guide
- Testing procedures
- Security considerations
- Troubleshooting guide
- References

## Maintenance

### When to Update Documentation
- Adding new features or components
- Changing existing functionality
- Modifying build or deployment processes
- Adding or removing dependencies
- Fixing bugs that affect usage
- Updating prerequisites or system requirements

### What to Document
- **Do document**: Public APIs, user-facing features, setup steps, architectural decisions
- **Don't document**: Internal implementation details that are clear from code
- **Consider documenting**: Complex algorithms, non-obvious behavior, workarounds

## Code Documentation

### Comments in Code
- Use comments sparingly - code should be self-documenting
- Comment "why" not "what" (what should be clear from code)
- Use JSDoc/TSDoc for TypeScript functions/classes
- Use COBOL comments for non-obvious mainframe logic

### TypeScript Documentation
```typescript
/**
 * Processes a deposit transaction
 * @param accountId - The account identifier
 * @param amount - The deposit amount in dollars
 * @returns The new account balance
 * @throws {InsufficientFundsError} If amount is negative
 */
export function processDeposit(accountId: string, amount: number): number {
  // Implementation
}
```

### COBOL Documentation
```cobol
      * Process deposit transaction
      * Updates account balance and writes to VSAM
           ADD AMOUNT TO WS-BALANCE.
           EXEC CICS REWRITE
               DATASET(WS-FILE-NAME)
               FROM(WS-FILE-REC)
           END-EXEC.
```

## Diagrams and Visual Aids

### ASCII Art Diagrams
- Use for simple architecture diagrams
- Keep lines under 80 characters
- Use consistent formatting

### Image Files
- Store in `img/` directory
- Use descriptive filenames (e.g., `login-screen.png`, `architecture-diagram.png`)
- Optimize images for web viewing
- Reference with relative paths: `![Description](img/filename.png)`

### Code Flow Diagrams
- Use code blocks or Markdown tables for simple flows
- Consider Mermaid diagrams for complex flows (if supported)

## Examples and Tutorials

### Code Examples
- Should be complete and runnable
- Include necessary imports/context
- Show both common and edge cases
- Add comments to explain non-obvious parts

### Step-by-Step Guides
1. Number steps clearly
2. Start with prerequisites
3. Show expected output after each step
4. Include troubleshooting for common issues
5. End with verification step

## Version Control

### Documentation Commits
- Update documentation in the same commit as code changes when possible
- Use clear commit messages: "docs: Update CLI installation instructions"
- Review documentation changes as carefully as code changes

### Documentation Reviews
- Check for accuracy
- Verify code examples work
- Ensure links are not broken
- Confirm formatting renders correctly
- Validate technical accuracy

## Special Considerations for zBANK

### Dual Architecture Documentation
- Clearly distinguish between COBOL and TypeScript implementations
- Show how modern TypeScript maps to COBOL concepts
- Provide migration guidance where applicable

### Educational Context
- Remember this is an educational project
- Explain concepts that might be unfamiliar to students
- Include background on mainframe vs. modern development
- Document security issues as learning opportunities

### Banking Domain
- Explain banking operations clearly
- Document data formats (account numbers, balances, PINs)
- Describe transaction types and their effects
- Clarify any banking-specific terminology

## Quality Checklist

Before committing documentation:
- [ ] Spelling and grammar checked
- [ ] Code examples tested and working
- [ ] Links verified
- [ ] Markdown formatting validated
- [ ] Screenshots/images up-to-date
- [ ] Version numbers current
- [ ] No sensitive information included
- [ ] Consistent with existing documentation style

## Tools and Resources

### Markdown Editors
- VS Code with Markdown extensions
- GitHub's web editor for quick fixes
- Markdown preview for formatting verification

### Spell Check
- Use editor spell check
- Review technical terms manually
- Maintain consistent terminology

### Link Validation
- Check internal links point to correct files/sections
- Verify external links are accessible
- Use relative links for internal navigation

## References
- [GitHub Markdown Guide](https://guides.github.com/features/mastering-markdown/)
- [Write the Docs Best Practices](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)
- [TypeScript TSDoc Reference](https://tsdoc.org/)
