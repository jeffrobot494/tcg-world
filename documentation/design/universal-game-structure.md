# Universal Game Structure: A Flexible Data Architecture for TCG World

## Introduction

The TCG World platform aims to enable creators to build any conceivable card game without programming knowledge. This requires a data architecture that can accommodate games ranging from traditional card games like Poker and Go Fish to spatial games with complex boards to entirely novel game structures we haven't yet imagined.

This document outlines a universal game structure approach that provides maximum flexibility while maintaining simplicity and usability. Rather than designing specific structures for known game types, we propose a composable framework that can represent virtually any table-based game.

## Core Design Principles

### 1. Universal Elements over Specific Types

Traditional game engines often define specific types for cards, boards, zones, etc. Instead, our approach uses a universal "Game Element" concept that can represent any game component through its properties and relationships. This allows creators to define entirely new game constructs without engine modifications.

### 2. Properties over Inheritance

Rather than using rigid inheritance hierarchies, our structure uses flexible property collections. A game element can have any combination of properties, allowing for unlimited variations without predetermined constraints.

### 3. Relationships over Hard-Coding

Game elements relate to each other through explicit references rather than hard-coded relationships. This allows for novel game structures where elements can interact in ways we haven't predicted.

### 4. Events over Procedures

Game flow is driven by an event system rather than procedural code. This enables complex chains of triggers and effects that can express virtually any game mechanic.

### 5. Abstract Positioning over Specific Layouts

Spatial relationships use an abstract positioning system that can express any arrangement from simple stacks to complex grids, allowing for unlimited board designs.

## The Universal Game Structure

### Game Elements

At the core of our system is the concept of a "Game Element" - a flexible container that can represent any game component:

- **Identity**: Each element has a unique identifier
- **Type**: A classification such as "card", "zone", "player", "token", etc.
- **Properties**: A flexible collection of attributes that define the element
- **References**: Links to other elements that establish relationships

This structure can represent:

- Cards with various attributes (cost, power, health, etc.)
- Zones where cards can be placed (hand, deck, battlefield, etc.)
- Players and their resources/state
- Tokens, counters, and other game trackers
- Any other game component we haven't considered

#### Example: Representing Different Card Types

With this structure, we can express very different card concepts:

- A traditional playing card (Ace of Spades) with suit and rank properties
- A Magic-style creature card with power, toughness, and mana cost
- A Pokemon-style card with HP, attacks, and energy requirements
- A hex-based unit card with movement range and attack capabilities
- An entirely novel card type with properties we haven't imagined

All of these would be "Game Elements" with different properties, without requiring different class structures for each.

### Universal Positioning

To accommodate any spatial arrangement, our system uses an abstract positioning concept:

- **Coordinate System Type**: Defines how coordinates should be interpreted (stack, grid, hex, free-form, etc.)
- **Coordinates**: Flexible array of values whose meaning depends on the coordinate system
- **Hierarchical References**: For nested positioning (e.g., card in a specific position in a hand)
- **Metadata**: Additional positioning information (orientation, stacking, etc.)

This approach can represent:

- **Stacks**: For decks, discard piles, etc. (single coordinate for position in stack)
- **Linear Arrangements**: For hands, card rows, etc. (one-dimensional positioning)
- **Grids**: For chess-like games (two-dimensional rectangular coordinates)
- **Hex Grids**: For hex-based strategy games (three coordinates in a cube system)
- **Free Positioning**: For games with arbitrary card placement (x, y coordinates with rotation)
- **3D Arrangements**: For games with vertical stacking or movement (x, y, z coordinates)
- **Novel Spatial Systems**: For entirely new types of boards (spherical, toroidal, etc.)

#### Example: Representing Different Game Boards

- A traditional card table would use "zone" elements with simple stack or linear positioning
- A chess-like board would use a grid coordinate system with elements at specific positions
- A hex-based tactical game would use a hex coordinate system with terrain properties
- A 3D space combat game could use three-dimensional coordinates with movement in all directions
- A planet exploration game might use spherical coordinates for positioning on a globe

### Zone System

Zones in our system are just game elements with containment properties:

- **Spatial Properties**: Define how contained elements are arranged (stack, grid, etc.)
- **Visibility Rules**: Determine which players can see the elements in the zone
- **Interaction Rules**: Define how players can interact with elements in the zone
- **Special Effects**: Triggered when elements enter, leave, or interact within the zone

This flexible approach allows for traditional zones like hands and decks, but also complex spatial arrangements like hex boards with special terrain effects.

#### Example: Different Zone Types

- **Deck**: A stack-based zone with hidden cards and orderable contents
- **Hand**: A linear zone with visibility restricted to the owner
- **Battlefield**: A grid or hex zone with public visibility and spatial positioning
- **Exile**: A special zone representing removed cards
- **Resource Pool**: A zone that generates or stores resources
- **Special Areas**: Custom zones with unique properties (portals, teleporters, etc.)

### Event System

Game progression is driven by an event system:

- **Event Types**: Categorize different game occurrences (card played, phase changed, etc.)
- **Sources and Targets**: Identify elements involved in the event
- **Event Data**: Additional information about what happened
- **Handlers**: Define what happens in response to events
- **Triggers and Effects**: Connect events to game state changes

This event-driven approach allows for complex chains of effects and counter-effects without requiring procedural code.

#### Example: Events in Different Games

- In a simple card game, drawing a card generates a "card drawn" event
- In a resource-based game, playing a card triggers a "resource spent" event
- In a hex-based game, moving a unit creates a "unit moved" event that might trigger terrain effects
- In a complex strategy game, an attack event might trigger defensive abilities, which trigger counter-effects

### Rules Framework

Game rules are defined as a collection of triggers and effects:

- **Phases**: Define the structure of game turns
- **Allowed Actions**: Specify what players can do in each phase
- **Triggers**: Define when special effects or rules activate
- **Effects**: Describe what happens when triggers are activated
- **Win Conditions**: Specify how the game is won or lost

This framework allows designers to create intricate rule systems by combining simple components.

#### Example: Rule Structures for Different Games

- A simple game might have "draw, play, end" phases with straightforward triggers
- A complex card game might have multiple specialized phases and intricate timing rules
- A strategy game could have movement phases, combat phases, and resource phases
- A novel game might introduce entirely new phase concepts based on its unique mechanics

## Real-World Applications

### Traditional Card Games

For games like Poker, Go Fish, or Hearts:

- Cards are elements with suit and rank properties
- The deck is a stack-based zone with randomization
- Hands are linear zones with visibility restrictions
- Simple rules govern drawing, playing, and scoring
- Win conditions check for specific card combinations

Despite their simplicity, our structure can represent all the nuances of these games, including specialized rules and scoring systems.

### Trading Card Games

For games like Magic: The Gathering or Hearthstone:

- Cards have complex properties (cost, power, effects)
- The battlefield zone uses spatial positioning for creatures and permanents
- Multiple specialized zones (hand, deck, graveyard, exile)
- Complex trigger systems for card effects
- Resource systems (mana, energy) track player capabilities
- Turn structures with multiple phases and priority systems

Our flexible architecture can represent these intricate games with their thousands of unique cards and interactions.

### Spatial Strategy Games

For hex-based or grid-based tactical games:

- The battlefield is a spatial zone with coordinate-based positioning
- Units have movement capabilities and spatial abilities
- Terrain effects modify movement and combat
- Line-of-sight and range calculations affect targeting
- Turn structures might include movement and combat phases

These games leverage our system's advanced spatial capabilities while using the same underlying structure as simpler card games.

### Entirely Novel Game Concepts

The true power of our approach becomes apparent when considering entirely new game types:

- 3D card games with vertical stacking and layering
- Games with dynamic boards that change shape during play
- Card games where the cards themselves form the playing surface
- Games with multiple interconnected boards or planes
- Time-based games where past moves affect future possibilities

Because our system makes no assumptions about what a "card game" should be, it can accommodate innovations we haven't even conceived yet.

## Creator Experience

### Tier 1: Simple Configuration (Natural Language)

For beginners, the system can translate natural language descriptions into appropriate structures:

"I want to create a game like Magic but with a hex grid battlefield"

The system would:
- Set up the basic zone structure similar to Magic
- Replace the standard battlefield with a hex-based zone
- Add movement properties to creature cards
- Maintain other Magic-like systems (mana, turn structure, etc.)

### Tier 2: Template Modification

Intermediate users can start with templates and modify specific aspects:

- Start with a hex-grid game template
- Change the grid dimensions and shape
- Add custom terrain types and effects
- Modify unit movement capabilities
- Adjust resource systems and turn structure

### Tier 3: Full Control

Advanced users can directly define all aspects of their game:

- Create custom element types with unique properties
- Design novel spatial systems
- Define intricate trigger networks
- Implement unique win conditions
- Build entirely new game mechanics

## Implementation Considerations

### Performance Optimization

The flexibility of this system comes with performance considerations:

- **Efficient Property Access**: Fast lookup for common properties
- **Relationship Indexing**: Quick identification of related elements
- **Event Filtering**: Targeted event delivery to relevant handlers
- **Spatial Algorithms**: Optimized calculations for different coordinate systems

### Rendering Adaptation

The visual representation must adapt to different game structures:

- **Dynamic Layouts**: Adjust to different zone types and arrangements
- **Coordinate Translation**: Convert abstract positions to screen coordinates
- **Visual Feedback**: Communicate game state clearly regardless of structure
- **Animation Systems**: Provide smooth transitions between states

### Rule Validation

With unlimited flexibility comes the need for robust validation:

- **Consistency Checking**: Ensure rule combinations are valid
- **Circle Detection**: Prevent infinite loops in trigger chains
- **Balance Heuristics**: Provide feedback on potential game balance issues
- **Playtesting Simulation**: Allow automated testing of game flows

## Conclusion

The Universal Game Structure approach provides a foundation that can represent virtually any card-based or table-based game imaginable. By focusing on flexibility and composition rather than predefined structures, we enable TCG World creators to build games limited only by their imagination.

This architecture embodies our core engineering principles:
- **Simplicity First**: A small set of universal concepts creates unlimited complexity
- **Single Source of Truth**: Game state is represented consistently regardless of game type
- **Composition Over Inheritance**: Games are built by combining simple elements
- **Clear Ownership**: Each aspect of the game has a defined responsibility
- **Forward-Thinking**: The system accommodates future innovations without redesign

With this foundation, TCG World can truly become a universal platform for card game creation, capable of hosting everything from classic card games to the most innovative designs of the future.