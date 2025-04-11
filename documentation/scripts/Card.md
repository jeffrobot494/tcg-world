# Card Class

## Overview
The `Card` class is the fundamental building block of the TCG World system. It represents a single card in the game and handles both its data properties and visual representation. This class is attached to individual card game objects in the Unity scene.

## Key Properties

### Core Information
- **id**: Unique identifier for the card
- **cardName**: The display name of the card
- **description**: Text description of the card's effects or abilities

### Game Attributes
- **cost**: Resource cost to play the card
- **attack**: Attack/damage value of the card
- **health**: Health/defense value of the card
- **cardType**: Category of the card (e.g., "Creature", "Spell", "Item")
- **tags**: List of keywords for categorization and rule processing

### State and Ownership
- **isFaceUp**: Whether the card is currently showing its face or back
- **isInteractable**: Whether the player can interact with this card
- **currentZone**: Reference to the zone where this card is located
- **ownerPlayerId**: ID of the player who owns this card

### Visuals
- **artwork**: The image displayed on the card, with automatic updating
- Various UI component references (nameText, costText, attackText, etc.)

## Key Methods

### Card Manipulation
- **FlipCard(bool faceUp)**: Turns the card face-up or face-down
- **MoveToPosition(...)**: Smoothly moves the card to a target position, rotation, and scale
- **UpdateCardText()**: Refreshes all text fields with current values

### Visual Handling
- **ApplyArtwork()**: Sets the artwork image on the appropriate UI component
- **FindUIComponents()**: Automatically locates and assigns references to UI elements

## How This Class Interacts with Others

- **CardZone**: Each Card maintains a reference to its current CardZone container
- **MainGame**: Cards are created and managed by the MainGame system
- **PlayerDeckManager**: Creates Card instances based on card data
- **CardImageLoader**: Loads card artwork from URLs

## Behind the Scenes

The Card class uses Unity's Transform system for smooth movement animations, with an Update method that gradually moves cards to their target position. It also has a flexible artwork system that can work with different types of renderers (SpriteRenderer, UI Image, etc.).

When working with Card objects, you typically don't create them directly, but rather use the PlayerDeckManager to create them from data. Cards are always contained within a CardZone, which manages their positioning and interactions.
