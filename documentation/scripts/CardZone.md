# CardZone Class

## Overview
The `CardZone` class represents a collection or area where cards can exist during gameplay. It manages groups of cards and their arrangement in the game world. Examples include a player's hand, deck, play area (field), and discard pile.

## Key Properties

### Identification
- **zoneName**: Name of this zone (e.g., "Deck", "Hand", "Field")
- **ownerPlayerId**: ID of the player who owns this zone (0 for shared zones)

### Behavior Configuration
- **isPublic**: Whether cards in this zone are visible to all players
- **isOrderable**: Whether cards can be manually reordered within this zone
- **isInteractable**: Whether players can interact with cards in this zone
- **maxCapacity**: Maximum number of cards this zone can hold (-1 for unlimited)

### Layout Configuration
- **layoutOrigin**: Starting position for laying out cards
- **layoutDirection**: Direction in which cards are arranged
- **cardSpacing**: Space between cards in the layout
- **faceUp**: Whether cards should be face-up or face-down in this zone
- **defaultRotation**: Default rotation for cards in this zone

### Card Collection
- **Cards**: Read-only access to the list of cards in this zone

## Key Methods

### Card Management
- **AddCard(Card card, int position)**: Adds a card to this zone at an optional position
- **RemoveCard(int index)**: Removes and returns a card at a specific index
- **RemoveCard(Card card)**: Removes a specific card from the zone
- **DrawCard()**: Removes and returns the top card (index 0)
- **ShuffleCards()**: Randomizes the order of all cards in the zone
- **UpdateCardPositions()**: Recalculates and updates the positions of all cards

## How This Class Interacts with Others

- **Card**: Cards maintain a reference to their current zone; zones position and orient cards
- **MainGame**: Creates and configures zones based on game rules
- **GameRulesInterpreter**: Provides zone configuration based on game rules

## Implementation Details

CardZone uses Unity's Transform system to physically arrange cards in 3D space. It manages the visual layout of cards, ensuring they are properly spaced and oriented according to the zone's purpose.

When cards are added or removed, the zone automatically updates the positions of all cards to maintain the proper layout. It also handles shuffling cards when needed, using a Fisher-Yates algorithm for true randomization.

## Best Practices

- Zones have different configurations depending on their purpose:
  - **Deck**: Usually face-down, tightly stacked
  - **Hand**: Fan layout with specific orientation
  - **Field**: Face-up with wider spacing
  - **Discard**: Face-up, slightly spread
  
- Always use a zone's methods to add/remove cards rather than manipulating the cards directly
- Remember that zones can have capacity limits - check before attempting to add cards

## Example Usage

In the game system, zones are typically created at startup based on the game rules. Players' hands, decks, and play areas are separate zones, while some games might have shared zones like a central marketplace or draft area.

When a player draws a card, the system removes it from their deck zone and adds it to their hand zone. When playing a card, it moves from the hand zone to the appropriate play zone, with all visual transitions handled automatically by the zone system.
