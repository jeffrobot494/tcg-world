# Development Approach for AI Agent Teams

## 1. Architecture Adaptations

### 1.1 Modular Microservices Architecture
- **Smaller, Well-Defined Components**: Break the system into smaller, self-contained microservices that fit within an AI agent's context window
- **Clear Domain Boundaries**: Define strict service boundaries that align with AI agent specializations
- **Standardized Interface Contracts**: Create detailed API contracts that can be referenced without needing to understand implementation details

### 1.2 Documentation-First Development
- **Comprehensive Interface Definitions**: Use OpenAPI/Swagger specs to define all APIs before implementation
- **Shared Data Models**: Create centralized data model definitions accessible to all AI agents
- **Decision Logs**: Maintain explicit logs of architectural decisions with context and reasoning

## 2. Development Process Modifications

### 2.1 Knowledge Management
- **Centralized Knowledge Repository**: Maintain a structured repository of all system components, decisions, and design patterns
- **Component Catalogs**: Create searchable catalogs of components with concise descriptions and links to detailed documentation
- **Design Pattern Library**: Establish a library of standardized patterns used across the project

### 2.2 Work Division Strategy
- **Vertical Feature Slicing**: Assign complete vertical slices of functionality to AI agents rather than horizontal layers
- **Specialized Domains**: Assign AI agents to domains that match their specialties (UI, game engine, networking, etc.)
- **Context-Optimized Tasks**: Size tasks to fit within the context limitations of AI agents

### 2.3 Handoff Procedures
- **Structured Knowledge Transfer Protocol**: Define explicit protocols for transferring work between AI agents
- **Contextual Summaries**: Create concise summaries of work completed for handoffs
- **State Preservation**: Document the current state and next steps when switching between AI agents

## 3. Code Organization and Structure

### 3.1 Self-Contained Modules
- **High Cohesion**: Ensure modules have high cohesion so they can be understood in isolation
- **Explicit Dependencies**: Make all dependencies explicit and minimal
- **Interface Segregation**: Favor many small, specific interfaces over fewer large ones

### 3.2 Coding Standards
- **Consistent Naming Conventions**: Use highly descriptive naming that conveys purpose without needing additional context
- **Self-Documenting Code**: Write code that is self-explanatory with minimal reliance on external documentation
- **Code Templates**: Create standardized templates for common patterns

### 3.3 Testing Approach
- **Component-Level Tests**: Focus on thorough testing of individual components
- **Contract Tests**: Emphasize testing of interface contracts between components
- **Automated Integration Tests**: Build comprehensive automated tests for component integration

## 4. Communication and Collaboration

### 4.1 Structured Communication Protocols
- **Standardized Communication Formats**: Define templates for requirements, questions, and feedback
- **Context Inclusion**: Always include relevant context with communications
- **Query Optimization**: Structure questions to minimize context needed to provide answers

### 4.2 Decision Making Framework
- **Distributed Decision Making**: Push decisions down to the appropriate specialized AI agents
- **Decision Templates**: Use structured templates for making and documenting decisions
- **Escalation Paths**: Define clear paths for escalating decisions that cross component boundaries

### 4.3 Conflict Resolution
- **Resolution Protocols**: Establish explicit protocols for resolving conflicting approaches
- **Trade-off Analysis Framework**: Use structured framework for analyzing trade-offs
- **Architectural Review Process**: Create lightweight review process for cross-cutting concerns

## 5. Implementation Strategies

### 5.1 Unity-Specific Approaches
- **Scriptable Object Architecture**: Use Unity's Scriptable Objects for defining configurations and shared data
- **Addressable Assets System**: Implement Unity's Addressable Assets system for efficient resource loading
- **Assembly Definition Files**: Utilize Assembly Definition files to enforce clean separation between modules

### 5.2 Backend Development Patterns
- **Function-as-a-Service**: Use serverless functions for isolated capabilities
- **CQRS Pattern**: Implement Command Query Responsibility Segregation for clear operation boundaries
- **Event-Driven Architecture**: Use events for loose coupling between components

### 5.3 Code Generation
- **API Scaffolding**: Generate boilerplate code from API specifications
- **Data Model Generation**: Generate data model code from schema definitions
- **Test Case Generation**: Generate test cases from specifications

## 6. Quality Assurance

### 6.1 Automated Verification
- **Static Analysis Tools**: Implement comprehensive static analysis for code quality and consistency
- **Automated Style Checking**: Enforce style guidelines through automation
- **Dependency Analysis**: Automatically verify dependency rules are followed

### 6.2 Continuous Integration
- **Incremental Builds**: Support incremental building of components
- **Isolated Component Testing**: Test components in isolation before integration
- **Feature Flags**: Use feature flags to enable/disable incomplete functionality

### 6.3 Documentation Generation
- **Automated Documentation**: Generate documentation from code and comments
- **Living Documentation**: Keep documentation updated automatically as code changes
- **Visualization Tools**: Generate visual representations of system components and relationships

## 7. Project Management Adaptations

### 7.1 Task Definition
- **Self-Contained Tasks**: Define tasks that are completely self-contained with all necessary context
- **Explicit Dependencies**: Clearly document task dependencies and prerequisites
- **Completion Criteria**: Provide explicit and verifiable completion criteria

### 7.2 Progress Tracking
- **Component-Based Milestones**: Define milestones at the component level
- **Interface Completion Tracking**: Track completion of interfaces separately from implementations
- **Integration Points**: Identify and track critical integration points between components

### 7.3 Risk Management
- **Component-Specific Risk Assessment**: Identify risks at the component level
- **Integration Risk Registry**: Maintain registry of cross-component integration risks
- **Technical Debt Tracking**: Explicitly track technical debt introduced due to context limitations

## 8. Special Considerations for AI Agent Collaboration

### 8.1 Context Window Optimization
- **Information Compression**: Develop techniques to compress information to fit context windows
- **Context Prioritization**: Prioritize what information to include in limited context
- **Progressive Disclosure**: Structure information to reveal details progressively as needed

### 8.2 Specialized Agent Roles
- **Architecture Guardian**: Agent responsible for maintaining architectural integrity
- **Integration Specialist**: Agent focused on component integration points
- **Documentation Maintainer**: Agent dedicated to keeping documentation current and accessible

### 8.3 Knowledge Persistence
- **Session Summaries**: Create concise summaries at the end of each development session
- **Decision Journals**: Maintain journals of key decisions with rationale
- **Context Maps**: Develop maps showing relationships between components and concepts

## 9. TCG-Specific Development Patterns

### 9.1 Card System Architecture
- **Card Definition System**: Modular system for defining cards with clear interfaces
- **Effect Resolution Pipeline**: Standardized pipeline for processing card effects
- **Rule Engine Interfaces**: Well-defined interfaces for the rule processing engine

### 9.2 Game State Management
- **Immutable Game State**: Use immutable patterns for game state to simplify reasoning about changes
- **Command Pattern Implementation**: Standardize command pattern for game actions
- **State Transition Documentation**: Clearly document all possible state transitions

### 9.3 AI Integration
- **LLM Query Templates**: Create standardized templates for LLM queries
- **Context Preparation Functions**: Define functions to prepare context for LLM interactions
- **Response Parsing Standards**: Standardize how LLM responses are parsed and validated
