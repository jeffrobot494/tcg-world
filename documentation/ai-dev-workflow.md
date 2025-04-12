# Effective AI Developer Workflow for Unity Projects

## Core Principles

1. **Clear Technical Specifications**
2. **Structured Approval Workflow**
3. **Scaffolded Tasks**
4. **Pair Programming**
5. **Lessons Learned Documentation**

## Streamlined Workflow Process

### 📋 Phase 1: Preparation

**Create Technical Specification**
- Define coding standards and Unity-specific guidelines
- Specify performance requirements and integration points

**Break Down Tasks**
- Divide features into smaller, manageable chunks with clear dependencies

> **Example:** For a card system implementation:
> - Task 1: Design data structures
> - Task 2: Create rendering components
> - Task 3: Implement initialization logic
> - Task 4: Develop positioning system

### 🔍 Phase 2: Design Approval

**Initial Design**
- Provide constraints and requirements
- Request documentation with diagrams/pseudocode
- Discuss design decisions and tradeoffs

**Design Review**
- Evaluate against technical specifications
- Check performance and compatibility

**Final Approval**
- Document agreed approach
- Set implementation checkpoints
- Define test scenarios

### 💻 Phase 3: Implementation

**Incremental Development**
- Establish review checkpoints
- Build core functionality before expanding
- Maintain consistent communication

**Testing & Refinement**
- Verify against predefined scenarios
- Review code quality
- Optimize performance

### 🧠 Phase 4: Knowledge Retention

**Pair Programming Sessions**
- Focus on knowledge transfer
- Document key decisions

**Lessons Learned**
- Record issues and solutions
- Include before/after code examples

## Example: Card System Implementation

**Technical Specification**
```
Requirements:
- Support for 1000+ cards
- Front/back textures with transitions
- Integration with Inventory class
- Object pooling for performance
- Multiple layout options
```

**Implementation Process**
1. AI developer proposes class structure
2. Review and approve design
3. Implement with checkpoints (Card class → Collections → Rendering → Integration)
4. Test against scenarios
5. Document implementation details

## Communication Templates

**Task Assignment**
```
Task: [Brief description]
Requirements: [Key technical requirements]
Integration: [Existing systems to connect with]
Performance: [Specific expectations]
References: [Documentation links]
```

**Design Review**
```
Strengths: [What works well]
Questions: [Areas needing revision]
Improvements: [Specific suggestions]
Checkpoints: [Review points]
```

## Tools

- Version Control: Git with structured branches
- Documentation: Shared wiki platform
- Unity-Specific: Appropriate use of ScriptableObjects and prefabs
