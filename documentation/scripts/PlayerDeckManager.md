# PlayerDeckManager Class

## Overview
The `PlayerDeckManager` class is responsible for loading card definitions from JSON data and creating playable card decks for players. It serves as the bridge between raw card data and the playable Card objects in the game world, handling both the loading of card information and the creation of physical card instances.

## Key Properties

### Singleton Access
- **Instance**: Static property to access the single instance of the deck manager

### Data Sources
- **cardsJsonFile**: JSON asset containing the library of available cards

### Internal Storage
- **cardCollection**: Collection of all loaded card data

## Key Concepts

### CardData
An internal data structure that represents the raw information about a card:
- **id**: Unique identifier
- **name**: Card name
- **type**: Card type (creature, spell, etc.)
- **cost**: Resource cost to play
- **attack**: Attack/damage value
- **health**: Health/defense value
- **description**: Card text/effect description
- **tags**: Categorization keywords
- **artworkUrl**: URL to the card's image

## Key Methods

### Card Loading
- **LoadCards()**: Loads card definitions from JSON sources

### Deck Creation
- **CreateRandomDeck(int playerId, int deckSize)**: Creates a randomized deck for a player
- **CreateCardFromData(CardData cardData, GameObject cardPrefab)**: Instantiates a playable Card from card data
- **PopulateZoneWithDeck(List<CardData> deck, CardZone zone, GameObject cardPrefab)**: Creates and adds all cards from a deck to a zone

## How This Class Interacts with Others

- **MainGame**: Uses the deck manager to create and populate player decks
- **Card**: Creates and configures Card instances from card data
- **CardZone**: Adds created cards to appropriate zones
- **CardImageLoader**: Uses to load card artwork from URLs

## Implementation Details

The PlayerDeckManager handles both static card data (loaded from JSON) and the creation of functional Card objects within the game.

Card loading follows these steps:
1. Load card definitions from a provided JSON asset
2. Parse the JSON structure using Newtonsoft.Json
3. Create internal CardData objects for each card definition
4. Store the full collection for later use

Deck creation typically follows this process:
1. Select a subset of cards from the full collection (randomly or by rules)
2. Create copies of the selected cards with player-specific IDs
3. Instantiate Game Objects for each card using the card prefab
4. Configure each card with appropriate data and ownership
5. Request artwork loading for each card
6. Add the cards to the appropriate zone (usually the player's deck)

## Best Practices

- Card IDs in decks include the player ID (multiplied by 1000) to ensure unique identification
- Each card in a deck is a separate instance, even if based on the same card definition
- Card artwork is loaded asynchronously to prevent performance issues
- Decks are typically created at game initialization but could be created later

## Example Usage

When the game starts:
1. MainGame requests the PlayerDeckManager to create decks for each player
2. PlayerDeckManager selects card data for each deck (randomly or by predefined lists)
3. For each card, it creates a physical Card instance with the appropriate data
4. It adds those cards to the player's deck zone
5. It requests artwork loading for each card, which happens asynchronously
6. The game then proceeds with shuffling and drawing initial hands

This system allows for flexible deck creation while ensuring that all card instances have the correct data and visual representation.
