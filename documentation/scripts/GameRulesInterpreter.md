# GameRulesInterpreter Class

## Overview
The `GameRulesInterpreter` class is responsible for loading, parsing, and interpreting game rules defined in JSON format. It serves as the bridge between the abstract rule definitions and their concrete implementation in the game. This class allows the game engine to support various card games with different rules without code changes.

## Key Properties

### Singleton Access
- **Instance**: Static property to access the single instance of the interpreter

### Parsed Rule Components
- **GameInfo**: Basic information about the game (name, player count, etc.)
- **CardProperties**: Properties that cards can have in this game
- **Zones**: Definitions of card zones in the game
- **TurnStructure**: Structure and phases of game turns
- **WinConditions**: Conditions that determine when a player wins

## Key Methods

### Rule Loading
- **LoadRules(TextAsset rulesJson)**: Loads and parses rules from a JSON asset
- **LoadRulesFromFile(string path)**: Loads and parses rules from a JSON file
- **ExtractRuleComponents()**: Breaks down the loaded rules into usable components

### Rule Interpretation
- **GetZoneNames()**: Retrieves the names of all zones defined in the rules
- **IsZonePublic(string zoneName)**: Checks if a zone is visible to all players
- **GetZoneMaxCards(string zoneName)**: Gets the maximum card capacity of a zone
- **IsActionAllowedInPhase(string action, string phase)**: Determines if an action is allowed in a specific game phase
- **GetStartingResources()**: Retrieves the initial resource count for players
- **GetMaxResources()**: Gets the maximum resource limit for players
- **GetResourcesPerTurn()**: Gets how many resources players gain each turn
- **CheckWinCondition(...)**: Evaluates if a win condition has been met

## How This Class Interacts with Others

- **MainGame**: Uses the interpreter to configure the game based on loaded rules
- **CardZone**: Zones are created and configured based on rule definitions
- **PlayerDeckManager**: May use rules to determine valid deck construction

## Implementation Details

This class uses the Newtonsoft.Json library to parse and navigate complex JSON rule structures. It acts as a central repository of game rules that other components can query for specific information.

The rules JSON structure is expected to contain several key sections:
- gameInfo: Basic game parameters
- cardProperties: Defining the attributes cards can have
- zones: Specifying the areas where cards can exist
- turnStructure: Defining the sequence and allowable actions in turns
- winConditions: Specifying how players can win

## Best Practices

- Game rules should always be loaded before attempting to start a game
- Use the interpreter's methods rather than directly accessing rule components
- Consider the interpreter as the final authority on game rules
- When extending the system, add new interpretation methods rather than having other classes parse the rules

## Example Usage

When the game starts:
1. MainGame loads a rule set through the interpreter
2. The interpreter parses the JSON and extracts the various components
3. MainGame uses the interpreter to set up players, resources, and zones
4. Throughout gameplay, the interpreter is consulted to determine valid actions
5. After each significant game event, win conditions are checked through the interpreter

This design allows for completely different card games to run in the same engine by simply changing the rules JSON file, without needing to modify the code.
