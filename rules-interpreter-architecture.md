# Rules Interpreter: Architectural Outline for AI Agent Implementation

## 1. Overview

The Rules Interpreter is the core engine component that reads, validates, and executes game rules defined in JSON format. It serves as the foundation for our data-driven TCG platform, enabling the execution of different card games without changing the codebase.

This architectural outline is specifically structured for implementation by AI agents, with each component having clear boundaries, explicit interfaces, and focused responsibilities.

## 2. High-Level Component Architecture

```
+-------------------------+     +-------------------------+
| Rules Parser            |     | Rules Repository        |
| - Loads JSON files      |---->| - Stores rule objects   |
| - Validates JSON schema |     | - Provides query access |
+-------------------------+     +-------------------------+
              |                              |
              v                              v
+-------------------------+     +-------------------------+
| Game State Manager      |<--->| Event System           |
| - Tracks all game state |     | - Broadcasts events    |
| - Manages state changes |     | - Connects components  |
+-------------------------+     +-------------------------+
        |         |                        |
        v         v                        v
+---------------+ | +-------------------+  |
| Turn Manager  | | | Action Validator  |  |
| - Phase logic | | | - Checks rules    |  |
| - Turn flow   | | | - Validates moves |  |
+---------------+ | +-------------------+  |
                  |         |              |
                  v         v              |
        +-------------------------+        |
        | Action Executor         |<-------+
        | - Processes actions     |
        | - Applies effects       |
        +-------------------------+
                    |
                    v
        +-------------------------+
        | Rule Checker            |
        | - Win conditions        |
        | - Game ending           |
        +-------------------------+
```

## 3. Component Specifications

### 3.1 Rules Parser (AI Agent: Developer)

**Purpose:** Load and validate game rules from JSON format.

**Key Responsibilities:**
- Parse JSON rule files
- Validate against JSON schema
- Convert JSON to in-memory rule objects
- Report validation errors

**Primary Classes:**
- `RulesParser`: Main parsing functionality
- `RulesValidator`: Schema validation
- `RuleParsingException`: Custom error handling

**Key Methods:**
- `ParseGameRules(string jsonContent): GameRules`
- `ValidateRules(GameRules rules): ValidationResult`

### 3.2 Rules Repository (AI Agent: Developer)

**Purpose:** Store rule objects and provide query access.

**Key Responsibilities:**
- Store all game rule definitions
- Provide efficient access to rule components
- Handle rule lookups and queries
- Support rule caching for performance

**Primary Classes:**
- `RulesRepository`: Main storage class
- `RuleQuery`: Query pattern for rule access
- `RuleCache`: Optional caching layer

**Key Methods:**
- `GetPhaseDefinition(string phaseId): PhaseDefinition`
- `GetActionDefinition(string actionType): ActionDefinition`
- `GetConditionDefinition(string conditionType): ConditionDefinition`
- `GetZoneDefinition(string zoneId): ZoneDefinition`

### 3.3 Game State Manager (AI Agent: Game Engine Specialist)

**Purpose:** Maintain the complete state of a game in progress.

**Key Responsibilities:**
- Track all game elements (cards, zones, players)
- Manage resource counters
- Handle state transitions
- Support state serialization/deserialization
- Maintain transaction history

**Primary Classes:**
- `GameState`: Root state container
- `Player`: Player state and resources
- `Zone`: Card collection with rules
- `Card`: Card instance with properties
- `GameStateSnapshot`: Point-in-time state capture

**Key Methods:**
- `Initialize(int playerCount): void`
- `GetActivePlayer(): Player`
- `MoveCard(Card card, string fromZone, string toZone): bool`
- `ModifyResource(int playerIndex, string resourceId, int amount): int`
- `CreateSnapshot(): GameStateSnapshot`
- `RestoreSnapshot(GameStateSnapshot snapshot): void`

### 3.4 Event System (AI Agent: Integration Specialist)

**Purpose:** Facilitate communication between components.

**Key Responsibilities:**
- Broadcast game events
- Allow components to subscribe to events
- Support event filtering
- Maintain event history for replay

**Primary Classes:**
- `EventSystem`: Central event manager
- `GameEvent`: Base event class
- `EventSubscription`: Subscription token
- `EventHistory`: Event logging

**Key Methods:**
- `RaiseEvent<T>(T gameEvent) where T : GameEvent`
- `Subscribe<T>(Action<T> handler, Func<T, bool> filter = null): EventSubscription`
- `Unsubscribe(EventSubscription subscription): void`

### 3.5 Turn Manager (AI Agent: Game Engine Specialist)

**Purpose:** Control turn flow and phase transitions.

**Key Responsibilities:**
- Track current phase and turn
- Handle phase transitions
- Manage turn order
- Execute phase-specific automatic actions

**Primary Classes:**
- `TurnManager`: Main turn control
- `Phase`: Current phase state
- `TurnTransition`: Turn change logic

**Key Methods:**
- `AdvancePhase(): PhaseTransitionResult`
- `SetPhase(string phaseId): PhaseTransitionResult`
- `GetCurrentPhase(): Phase`
- `GetNextPlayer(): int`

### 3.6 Action Validator (AI Agent: Game Engine Specialist)

**Purpose:** Validate player actions against game rules.

**Key Responsibilities:**
- Check if actions are legal
- Validate targets and costs
- Evaluate conditions from rule set
- Provide valid action options

**Primary Classes:**
- `ActionValidator`: Main validation logic
- `ConditionEvaluator`: Rule condition checking
- `TargetValidator`: Action target validation
- `CostValidator`: Resource cost checking

**Key Methods:**
- `ValidateAction(GameAction action): ValidationResult`
- `GetAvailableActions(Player player): List<AvailableAction>`
- `EvaluateCondition(Condition condition, GameState state): bool`

### 3.7 Action Executor (AI Agent: Developer)

**Purpose:** Process actions and apply their effects.

**Key Responsibilities:**
- Execute validated actions
- Apply effects to game state
- Handle chained effects
- Process triggered abilities

**Primary Classes:**
- `ActionExecutor`: Main execution logic
- `EffectProcessor`: Effect application
- `EffectResolver`: Complex effect resolution
- `ActionTransaction`: Atomic action group

**Key Methods:**
- `ExecuteAction(GameAction action): ActionResult`
- `ApplyEffect(Effect effect, ActionContext context): EffectResult`
- `ProcessTriggers(GameAction action): List<Effect>`
- `BeginTransaction(): ActionTransaction`

### 3.8 Rule Checker (AI Agent: Developer)

**Purpose:** Check for game end conditions and rule violations.

**Key Responsibilities:**
- Evaluate win/loss conditions
- Check for game ending states
- Enforce game-specific rules
- Report rule violations

**Primary Classes:**
- `RuleChecker`: Main rule checking
- `WinConditionEvaluator`: Win condition logic
- `StateViolationChecker`: Invalid state detection

**Key Methods:**
- `CheckWinConditions(): GameResult`
- `CheckGameEnd(): bool`
- `ValidateGameState(): List<RuleViolation>`

## 4. Key Data Structures

### 4.1 Game Rules

```csharp
public class GameRules
{
    public GameInfo GameInfo { get; }
    public List<ZoneDefinition> Zones { get; }
    public List<CardProperty> CardProperties { get; }
    public List<ResourceDefinition> Resources { get; }
    public TurnStructure TurnStructure { get; }
    public List<WinCondition> WinConditions { get; }
}
```

### 4.2 Game State

```csharp
public class GameState
{
    public List<Player> Players { get; }
    public Dictionary<string, Zone> Zones { get; }
    public TurnManager TurnManager { get; }
    public int ActivePlayerIndex { get; set; }
    public ActionHistory History { get; }
    public EventSystem Events { get; }
}
```

### 4.3 Game Action

```csharp
public class GameAction
{
    public string Type { get; }
    public int PlayerIndex { get; }
    public Dictionary<string, object> Parameters { get; }
    
    public void AddParameter(string key, object value);
    public T GetParameter<T>(string key);
    public bool HasParameter(string key);
}
```

### 4.4 Card

```csharp
public class Card
{
    public string Id { get; }
    public string DefinitionId { get; }
    public int OwnerIndex { get; }
    public Dictionary<string, object> Properties { get; }
    public Dictionary<string, object> Markers { get; }
    
    public T GetProperty<T>(string key);
    public void SetProperty(string key, object value);
    public bool HasProperty(string key);
    
    public void SetMarker(string key, object value);
    public void RemoveMarker(string key);
    public bool HasMarker(string key);
}
```

## 5. Development Approach for AI Agents

### 5.1 Interface-First Development

Each component should begin with a clear interface definition:

```csharp
public interface IActionValidator
{
    ValidationResult ValidateAction(GameAction action);
    List<AvailableAction> GetAvailableActions(Player player);
    bool EvaluateCondition(Condition condition, GameState state);
}
```

### 5.2 Implementation Sequence

Components should be implemented in this order to minimize dependencies:

1. Rules Parser & Rules Repository
2. Basic Game State structures (without advanced logic)
3. Event System
4. Turn Manager
5. Action Validator
6. Action Executor
7. Rule Checker
8. Complete Game State Manager

### 5.3 Testing Strategy

- Create small, focused unit tests for each component
- Use mock data and dependencies
- Test each method independently
- Provide sample JSON for testing

### 5.4 Documentation Requirements

Each component should include:

- Interface documentation
- Class responsibility descriptions
- Method parameter details
- Exception documentation
- Sample usage examples

## 6. Integration Points

### 6.1 Main API Surface

The `RulesInterpreter` class serves as the façade for the entire system:

```csharp
public class RulesInterpreter
{
    // Initialization
    public RulesInterpreter(string rulesJson);
    public GameState InitializeGame(int playerCount);
    
    // Game flow
    public ActionResult ProcessAction(GameAction action);
    public PhaseTransitionResult AdvancePhase();
    public GameResult CheckGameEnd();
    
    // Information access
    public List<AvailableAction> GetAvailableActions();
    public GameState GetGameState();
}
```

### 6.2 UI Integration

UI components interact with the Rules Interpreter via:

- Direct method calls for actions
- Event subscriptions for state changes
- Query methods for available actions

## 7. Communication Between AI Agents

When handing off components between agents, include:

1. **Interface Definition**: Complete interface with documentation
2. **Implementation Notes**: Key algorithms and patterns used
3. **Dependencies**: Required components and expectations
4. **Sample Usage**: Example code showing typical use
5. **Test Cases**: Specific test scenarios to validate implementation

## 8. Error Handling Strategy

- Use specific exception types for different error categories
- Provide detailed error messages
- Include context in error information
- Use result objects for expected failure cases
- Log errors through the event system

## 9. Initial Implementation Focus

For the simplified MVP, focus on implementing:

1. Basic rule parsing from JSON
2. Simple game state management
3. Core turn structure
4. Basic action validation and execution
5. Minimal win condition checking

This will provide a functional foundation that demonstrates the core concept of data-driven game rules.
