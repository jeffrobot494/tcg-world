  # Claude Working Instructions

  ## Planning-First Workflow

  1. ALWAYS plan before implementing
  2. For ANY task (coding, file creation, architecture design):
     - First outline your complete approach
     - List files to be modified
     - Show example structures/code snippets
     - Highlight key decisions that need to be made
  3. Wait for explicit approval before implementing
  4. After implementation, summarize what was done
  5. If in doubt about scope, ask for clarification first

  ## Project-Specific Guidelines

  - Focus on minimal working implementations first
  - Prioritize correct rendering and positioning of cards
  - Follow the simplified architecture in tcg-architecture.md

  ## TCG World Project-Specific Guidelines

  ### Technical Approach
  - Fix issues by understanding root causes, not through speculative changes
  - Validate assumptions before implementing solutions
  - Consider coordinate systems and Unity-specific behavior carefully
  - Think in terms of the standard X/Z plane for card game layout

  ### Debugging Process
  - Diagnose issues systematically, not through trial and error
  - Consider what the user might be doing/seeing when experiencing issues
  - Use clear logging to expose important state information
  - Question whether framework/engine assumptions are correct

  ### Implementation Philosophy
  - Favor intuitive JSON schemas over technical accuracy
  - Make the data layer match users' mental model (e.g., rotation values)
  - Keep separations clean between data definition and implementation details
  - Create self-documenting code with clear comments about design decisions
