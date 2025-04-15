# TCG World - Handoff Generation Instructions

You are preparing a detailed handoff document that will allow a new AI instance to continue work on the TCG World project in a fresh conversation. This handoff must preserve all relevant context and instructions needed for task continuation.

## Initial Review Process

First, systematically review your entire conversation history in chronological order, paying special attention to:
- User corrections and refinements of your understanding
- Evolution of requirements and constraints through the conversation
- Changes in approach or methodology
- Emerging patterns in task execution
- Alignment with the TCG World architecture principles

## Content Organization

Create an organized index of all relevant details, including but not limited to:
- The original task and its requirements
- Key decisions and their rationales
- Important clarifications or modifications
- Established patterns of work or communication
- User preferences and expertise level
- Progress made and current status
- Known issues and their solutions
- Planned next steps
- Any relevant file paths or resources

## TCG World-Specific Elements

Ensure your handoff captures the following project-specific elements:

### Core Architecture Status
- Data Layer implementation status (GameRules, ZoneData, CardData, etc.)
- Service Layer implementation status (GameManager, CardService, ZoneService, etc.)
- View Layer implementation status (CardView, ZoneView, etc.)
- Current JSON schema definitions and implementation

### Unity Implementation Details
- Scene hierarchy and organization
- Prefab status and configurations (Card Prefab, Zone Prefab, etc.)
- MonoBehaviour and ScriptableObject implementations
- Current rendering and positioning approach for cards and zones
- Coordinate system conventions being used (X/Z plane)

### Planning-First Workflow Context
- Status of any planning steps completed
- Example of planning format used in previous tasks
- Reminder of the requirement to plan before implementation

### Engineering Principles Application
- Note specific applications of the 10 engineering principles
- Highlight any principle-related decisions made
- Identify areas where principles need special attention

## Validation and Finalization

Present this index to the user for validation and request any corrections or additions.

After receiving confirmation, generate the comprehensive handoff document. For each item in your index, return to the full conversation context to extract and incorporate complete details, nuances, and interconnections. Your handoff should allow the receiving instance to proceed with minimal additional user input beyond what would have been needed in the current conversation.

If you received a previous handoff yourself, incorporate all still-relevant information from it, including applicable instructions, completed work, and ongoing considerations.

## Formatting Guidelines

Format your handoff using plain, detailed language in a markdown code block. Include absolute paths to relevant files or directories but do not include file contents. For any code blocks within your handoff, use single backticks or other markdown formatting that won't conflict with the outer triple backticks of the handoff itself.

Clearly demarcate direct instructions for the receiving instance using <instructions> tags. These instructions represent your role as proxy for the user - you are directly instructing the next instance how to proceed with the task. Ensure these instructions incorporate all relevant guidance, requirements, and constraints that should govern the receiving instance's work.

## Required Sections

The handoff must include:
- Full project/task context and objectives
- All current and applicable instructions, noting which original requirements have been superseded or completed
- Detailed progress summary by system component
- Implementation state for each architectural layer (Data, Service, View)
- Resource locations and access guidelines
- Known issues, attempted solutions, and current workarounds
- Clear next steps with any dependencies or prerequisites
- References to key documentation:
  - CLAUDE.md
  - tcg-architecture.md
  - Any other critical project documents

## Key Document References

Always include explicit references to these foundational documents:
- `/mnt/c/Users/jeffr/OneDrive/Documents/tcg-world/CLAUDE.md` - Role and working instructions
- `/mnt/c/Users/jeffr/OneDrive/Documents/tcg-world/tcg-architecture.md` - Architecture principles
- `/mnt/c/Users/jeffr/OneDrive/Documents/tcg-world/tcg-world-vision.md` - Overall project vision

## Final Review

Present the final handoff to the user for review before ending the conversation.