# TCG World - Complete Platform Vision

## Platform Overview

TCG World is a flexible game engine platform designed to enable the creation and playing of diverse trading card games without requiring programming knowledge. This document outlines the complete vision for the platform, including all planned features and systems.

## Core Innovations

1. **Rules-as-Data Architecture**: Game mechanics defined in structured JSON rather than hardcoded
2. **LLM-Powered Creation**: Natural language conversion to game rules and card effects
3. **Extensible Effect System**: Handles complex card interactions through a combination of JSON and scripting
4. **Creator-Friendly Tools**: Intuitive interfaces for game creation without technical expertise
5. **AI Opponents**: Adaptive opponents that understand different game types and rule sets

## System Architecture

### Game Control and Flow

- **MainGame**: Central controller that orchestrates all components
  - Initializes the game based on loaded rules
  - Manages the turn-based flow of gameplay
  - Processes player actions and AI decisions
  - Checks win conditions and determines game outcomes

- **GameRulesInterpreter**: Loads and interprets rule definitions
  - Processes structured JSON rule definitions
  - Provides game structure information (zones, phases, etc.)
  - Validates gameplay actions against rules
  - Evaluates win conditions
  - Manages resource systems
  - Processes standard card effects
  - Delegates to scripting engine for complex effects

### Card System

- **Card**: Represents individual cards in the game
  - Stores properties defined in JSON (cost, power, etc.)
  - Manages visual representation
  - Handles card-specific behaviors
  - Executes effect logic

- **CardZone**: Manages collections of cards
  - Organizes cards in different areas (deck, hand, field, etc.)
  - Handles spatial arrangement and visualization
  - Manages zone-specific behaviors (drawing, shuffling, etc.)

### Data Management

- **PlayerDeckManager**: Manages deck creation and loading
  - Loads card definitions from JSON
  - Creates and configures card instances
  - Builds player decks (random or defined)
  - Manages card creation and initialization

- **CardImageLoader**: Handles artwork acquisition
  - Downloads card images from URLs
  - Caches images to avoid redundant downloads
  - Applies artwork to cards once loaded

### Effect System

- **EffectProcessor**: Handles card effect execution
  - Processes effects based on JSON definitions
  - Manages effect targeting and resolution
  - Handles triggers and state-based actions
  - Maintains effect timing and priority system

- **EffectQueue**: Manages the ordering of effects
  - Handles effect stacking
  - Resolves timing conflicts
  - Provides priority windows for responses

### Scripting System

- **LuaScriptEngine**: Executes custom card behaviors
  - Provides sandboxed execution environment
  - Exposes game API to scripts
  - Manages event hooks and triggers
  - Handles complex effect resolution

- **LLM Script Compiler**: Converts natural language to Lua
  - Processes card effect descriptions
  - Generates valid Lua scripts
  - Validates script behavior

### LLM Integration

- **RulesGenerator**: Converts natural language to JSON rules
  - Processes game descriptions
  - Generates rule structures
  - Validates rule consistency

- **CardEffectGenerator**: Processes card effect text
  - Converts descriptions to structured effect data
  - Handles complex conditional logic
  - Generates scripts for advanced effects

- **AI Opponent**: Strategic decision-making
  - Understands game rules and card effects
  - Makes optimal plays based on game state
  - Adapts to different game types
  - Provides explanations for decisions

### User Interface

- **Card Creator**: Interface for designing cards
  - Visual card editor
  - Natural language effect input
  - Card preview and testing

- **Game Designer**: Tools for creating game rules
  - Rule structure editor
  - Natural language rule definition
  - Game simulation and testing

- **Deck Builder**: Interface for creating decks
  - Card browsing and selection
  - Deck validation against rules
  - Stats and analysis

- **Gameplay UI**: Interface for playing games
  - Card visualization and interaction
  - Game state display
  - Action system
  - Effect visualization

## Rules-as-Data System

### JSON Rule Structure

Game rules are defined in comprehensive JSON documents with these key sections:

1. **Game Metadata**: Name, description, player count, etc.
2. **Zones**: Card locations (deck, hand, field, graveyard, etc.)
3. **Resources**: Player values (life, mana, energy, etc.)
4. **Card Properties**: Attributes cards can have
5. **Turn Structure**: Phases and allowed actions
6. **Card Types**: Categories of cards with shared behaviors
7. **Win Conditions**: How the game is won/lost
8. **Effect Definitions**: Standard card effects and behaviors
9. **Script References**: Links to scripts for complex effects

### Example Structure

```json
{
  "gameInfo": {
    "name": "Example TCG",
    "description": "A sample trading card game",
    "playerCount": 2,
    "initialPlayerHealth": 20
  },
  "zones": [
    {
      "id": "deck",
      "name": "Deck",
      "owner": "player",
      "faceUp": false,
      "ordered": true,
      "maxCards": 60,
      "minCards": 40,
      "startingCards": 0,
      "drawAction": true
    },
    {
      "id": "hand",
      "name": "Hand",
      "owner": "player",
      "faceUp": "owner",
      "ordered": false,
      "maxCards": -1,
      "minCards": 0,
      "startingCards": 7,
      "playAction": true
    }
  ],
  "turnStructure": {
    "phases": [
      {
        "id": "drawPhase",
        "name": "Draw Phase",
        "actions": ["draw"],
        "autoActions": [
          {
            "action": "drawCard",
            "count": 1,
            "target": "activePlayer"
          }
        ]
      },
      {
        "id": "mainPhase",
        "name": "Main Phase",
        "actions": ["playCard", "activateEffect", "combat"]
      }
    ],
    "resourceSystem": {
      "type": "mana",
      "startingAmount": 1,
      "gainPerTurn": 1,
      "maxAmount": 10
    }
  },
  "winConditions": [
    {
      "type": "healthReduction",
      "threshold": 0
    },
    {
      "type": "deckDepletion"
    }
  ]
}
```

## Card Effect System

The card effect system will handle a wide range of effect types:

1. **Stat Modifications**: Changes to card values (attack, health, etc.)
2. **Zone Movements**: Moving cards between zones (draw, discard, etc.)
3. **Resource Changes**: Adding or removing player resources
4. **Conditional Effects**: Effects that only happen under certain conditions
5. **Targeting Effects**: Effects that require selecting targets
6. **Triggered Effects**: Effects that happen in response to events
7. **Continuous Effects**: Effects that persist for a duration
8. **Replacement Effects**: Effects that replace other game events

### Effect Structure

```json
{
  "effectType": "damage",
  "amount": 3,
  "target": {
    "type": "player",
    "selection": "opponent"
  },
  "condition": {
    "type": "onPlay"
  }
}
```

## Scripting System

For cases where standard JSON effects are insufficient, the Lua scripting system will provide:

### API Categories

```lua
-- Game state queries
getCard(id)
getZone(zoneType, owner)
getPhase()
getActivePlayer()

-- Player actions
drawCards(player, count)
gainLife(player, amount)
payMana(player, cost)

-- Card manipulation
moveCard(card, sourceZone, destinationZone)
attachCard(card, target)
transformCard(card, newState)

-- Effect creation
createDelayedTrigger(event, condition, effect)
createContinuousEffect(effect, duration)
createReplacementEffect(originalEvent, replacementAction)

-- Event registration
triggerWhen(eventType, callback)
```

### Script Examples

```lua
-- Take an extra turn effect
function onResolve(card, controller)
  -- Create a delayed trigger for the end of turn
  createDelayedTrigger(
    "endOfTurn", 
    function() return getActivePlayer() == controller end,
    function() 
      -- Instead of proceeding to next player, give active player another turn
      grantExtraTurn(controller)
      -- Move this card to exile zone
      moveCard(card, getZone("stack", nil), getZone("exile", nil))
    end
  )
  return true
end
```

## LLM Integration

### Rule Generation

The LLM rule generation system will:

1. Accept natural language descriptions of card games
2. Generate complete JSON rule structures
3. Interpret game mechanics from descriptions
4. Provide explanations and previews
5. Allow refinement and iteration

### Effect Generation

The effect generation system will:

1. Process natural language effect descriptions
2. Identify standard vs. complex effects
3. Generate JSON for standard effects
4. Generate Lua scripts for complex effects
5. Provide visual previews of effect behavior

### AI Opponent

The LLM-powered AI opponent will:

1. Analyze the game state comprehensively
2. Understand the rules and card effects dynamically
3. Make strategic decisions based on game knowledge
4. Adapt to different game types and mechanics
5. Provide natural-feeling gameplay
6. Offer explanations for its decisions

## User Creation Tiers

### Tier 1 (Beginners)

- Pure natural language game design
- "Create a card game like X but with Y mechanics"
- No JSON or code editing required
- System handles all technical details

### Tier 2 (Intermediate)

- Template-based approach
- Selection from common game patterns
- Parameter customization
- Limited direct JSON editing
- Natural language for card effects

### Tier 3 (Advanced)

- Direct JSON rule editing
- Custom effect creation
- Optional Lua scripting for complex cards
- Full control over game mechanics

## Game Creation Workflow

1. **Game Definition**:
   - Define core game structure and rules
   - Specify zones, phases, and resources
   - Set win conditions

2. **Card Creation**:
   - Define card types and attributes
   - Create card effects
   - Design visual appearance

3. **Deck Building**:
   - Create starter decks
   - Define deck building rules
   - Balance card distribution

4. **Testing**:
   - Play against AI opponents
   - Simulate different scenarios
   - Balance adjustments

5. **Publishing**:
   - Make game available to others
   - Create tutorial content
   - Gather player feedback

## Future Expansion Possibilities

1. **Online Multiplayer**: Real-time and asynchronous matches
2. **Tournament System**: Organized competitive play
3. **Marketplace**: Trading and collecting systems
4. **Campaign Creator**: Single-player story experiences
5. **Mobile Integration**: Cross-platform play
6. **Analytics**: Game balance and player behavior tools

## Conclusion

The TCG World platform represents a complete reimagining of card game creation, making it accessible to everyone while maintaining the depth and complexity that makes card games engaging. By combining rules-as-data architecture with LLM-powered interfaces, we can create a system that grows with the user from simple designs to complex game systems.