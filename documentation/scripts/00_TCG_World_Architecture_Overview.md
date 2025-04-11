# TCG World Architecture Overview

## System Architecture

The TCG World platform is designed as a flexible engine for creating and running trading card games with different rules and mechanics. The architecture follows these core principles:

1. **Rule-Driven Design**: Game rules are defined in external JSON files, not hardcoded
2. **Component-Based Structure**: Each aspect of the game is managed by specialized components
3. **Extensibility**: The system can be extended to support various card games
4. **Separation of Concerns**: Data, presentation, and logic are kept separate

## Core Components and Their Relationships

### Game Control and Flow

**MainGame** serves as the central controller, orchestrating all other components. It:
- Initializes the game based on loaded rules
- Manages the turn-based flow of gameplay
- Processes player actions and AI decisions
- Checks win conditions and determines game outcomes

**GameRulesInterpreter** loads and interprets JSON rule definitions, providing:
- Game structure information (zones, turn phases, etc.)
- Rule validation for gameplay actions
- Win condition evaluation
- Resource management rules

### Card System

**Card** represents individual cards in the game and manages both:
- Data properties (cost, attack, health, etc.)
- Visual representation (artwork, text, animations)

**CardZone** manages collections of cards, handling:
- Card organization (deck, hand, field, etc.)
- Spatial arrangement and visualization
- Card movement between zones
- Zone-specific behaviors (shuffling, drawing, etc.)

### Data Management

**PlayerDeckManager** bridges card data and playable cards:
- Loads card definitions from JSON
- Creates and configures card instances
- Builds player decks (random or defined)
- Manages card creation and initialization

**CardImageLoader** handles remote artwork loading:
- Downloads card images from URLs
- Caches images to avoid redundant downloads
- Applies artwork to cards once loaded

## Workflow: From Rules to Gameplay

1. **Rule Loading**:
   - MainGame starts by loading game rules via GameRulesInterpreter
   - Rules define zones, turn structure, win conditions, and resource systems

2. **Game Setup**:
   - MainGame creates players based on rules
   - Card zones are created according to zone definitions
   - PlayerDeckManager loads card definitions and creates player decks
   - Initial cards are dealt to players' hands

3. **Gameplay Loop**:
   - MainGame manages turn sequencing
   - Players can perform actions according to rules (play cards, draw, etc.)
   - Card effects are processed based on their definitions
   - Win conditions are checked after significant game events

4. **Card Lifecycle**:
   - Cards start in the deck zone, face-down
   - When drawn, they move to the hand zone
   - When played, they move to the appropriate play zone
   - Effects are triggered based on card definitions and game rules
   - Cards may move to the discard zone when used or destroyed

## Extending the System

The TCG World platform can be extended in several ways:

1. **Creating New Card Games**:
   - Define new rule sets in JSON format
   - Create card definitions with appropriate properties and effects
   - No code changes required for basic functionality

2. **Adding New Mechanics**:
   - Extend the GameRulesInterpreter with new rule interpretation methods
   - Add corresponding behavior implementations in MainGame
   - Update Card class to handle new effect types if needed

3. **Enhancing Visuals**:
   - Modify the Card class to support new visual elements
   - Update card prefabs with additional UI components
   - Extend CardImageLoader for different artwork sources

## Design Philosophy

The TCG World system embraces these design principles:

- **Data-Driven**: Game behavior is defined by data, not code
- **Modular**: Components have clear responsibilities and interfaces
- **Flexible**: The system accommodates various game types and rules
- **User-Focused**: Design prioritizes smooth gameplay experiences
- **Extensible**: New features can be added without restructuring the core

This architecture allows game creators to focus on designing card games rather than implementing core systems, while still providing the flexibility to create diverse and engaging card game experiences.
