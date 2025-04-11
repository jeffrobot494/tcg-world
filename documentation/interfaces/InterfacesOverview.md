# Interface Abstractions in TCG-World

## Overview

This document provides information about the core interfaces that have been implemented to improve flexibility and extensibility in the TCG-World project. These interfaces establish clear contracts between components, reducing tight coupling and enabling future extensions without modifying existing code.

## Core Interfaces

### `ICard`

The `ICard` interface defines the contract for all card types in the system.

**Key Properties:**
- `ID`: Unique identifier for the card
- `Name`: Display name of the card
- `Description`: Card's description text
- `OwnerID`: ID of the player who owns the card
- `IsFaceUp`: Whether the card is currently face-up
- `Artwork`: Visual representation of the card

**Key Methods:**
- `FlipCard(bool)`: Change the face-up/down state of the card
- `UpdateVisuals()`: Refresh the visual representation
- `CurrentContainer`: Get/set the container holding this card

### `ICardContainer`

The `ICardContainer` interface defines the contract for any component that can contain cards.

**Key Properties:**
- `Name`: Identifier for the container
- `IsPublic`: Whether contents are visible to all players
- `OwnerID`: Player who owns this container
- `Count`: Number of cards in the container
- `Cards`: List of cards in the container

**Key Methods:**
- `AddCard(ICard)`: Add a card to the container
- `RemoveCard(ICard)`: Remove a card from the container
- `DrawCard()`: Draw the top card from the container
- `ShuffleCards()`: Randomize the order of cards
- `UpdateLayout()`: Update the visual positioning of cards

### `IGameRule`

The `IGameRule` interface defines how game rules are interpreted and enforced.

**Key Properties:**
- `GameInfo`: Basic game information
- `Zones`: Zone definitions for the game
- `TurnStructure`: Definition of turn phases and actions

**Key Methods:**
- `LoadRules(TextAsset)`: Load rule definitions from JSON
- `IsActionAllowedInPhase(string, string)`: Check if an action is allowed in a phase
- `ValidateCardPlay(ICard, ICardContainer, int)`: Validate if a card can be played
- `GetStartingResources()`: Get initial resource amount
- `GetMaxResources()`: Get maximum resource limit
- `GetResourcesPerTurn()`: Get resources gained each turn

## Implementation

These interfaces have been implemented by the following classes:

1. `Card` implements `ICard`
2. `CardZone` implements `ICardContainer`
3. `GameRulesInterpreter` implements `IGameRule`

## Benefits of Interface Abstraction

1. **Loose Coupling**: Components interact through interfaces rather than concrete implementations
2. **Extensibility**: New card types, containers, and rule sets can be added without modifying existing code
3. **Testability**: Interfaces can be mocked for unit testing
4. **Clear Contracts**: Explicit definition of what each component should provide
5. **Modularity**: Components can be replaced with alternative implementations

## How to Extend

### Creating a New Card Type

To create a new card type, implement the `ICard` interface:

```csharp
public class SpecialCard : MonoBehaviour, ICard 
{
    // Implement all required ICard properties and methods
    
    // Add special card-specific properties and methods
}
```

### Creating a New Container Type

To create a new container type, implement the `ICardContainer` interface:

```csharp
public class SpecialZone : MonoBehaviour, ICardContainer
{
    // Implement all required ICardContainer properties and methods
    
    // Add special zone-specific properties and methods
}
```

### Creating New Game Rules

To create a new rule set, implement the `IGameRule` interface:

```csharp
public class SpecialRules : MonoBehaviour, IGameRule
{
    // Implement all required IGameRule properties and methods
    
    // Add special rule-specific properties and methods
}
```

## Future Considerations

As the system grows, consider:

1. **More Granular Interfaces**: Breaking down interfaces for more specific functionality
2. **Abstract Base Classes**: Adding abstract classes that implement common functionality
3. **Factory Patterns**: For creating various card and container types
4. **Dependency Injection**: To further decouple components

These interfaces provide a solid foundation for future expansion while maintaining code clarity and maintainability.
