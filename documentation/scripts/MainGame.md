# MainGame Class

## Overview
The `MainGame` class is the central controller for the entire TCG World platform. It orchestrates all gameplay elements, manages the game state, handles turn progression, and coordinates interactions between players, cards, and zones. This is the core script that brings all other components together into a cohesive game system.

## Key Properties

### Singleton Access
- **Instance**: Static property to access the single instance of the game controller

### Game Configuration
- **gameRulesJson**: JSON asset containing rules for the current game
- **cardPrefab**: Prefab used to create card game objects
- **cardZonePrefab**: Prefab used to create zone game objects
- **cardListJson**: JSON asset containing the available card library

### Player Management
- **players**: List of Player objects representing participants in the game
- **currentPlayerIndex**: Index of the player whose turn it currently is

### Game State
- **gameInProgress**: Whether a game is currently running
- **turnNumber**: Current turn number
- **currentPhase**: Current phase within the turn
- **zonesByName**: Dictionary of all card zones for quick access

## Key Methods

### Game Initialization
- **InitializeGame()**: Sets up a new game using the current rules
- **SetupPlayers()**: Configures players based on game rules
- **CreateCardZones()**: Creates and configures zones from rule definitions
- **InitializePlayerCards()**: Sets up player decks and initial hands

### Turn Management
- **BeginTurn(Player player)**: Starts a player's turn
- **EndTurn()**: Ends the current turn and moves to the next player
- **BeginPhase(string phaseName)**: Starts a specific phase of the turn

### Card Actions
- **DrawCardForPlayer(Player player)**: Has a player draw a card
- **PlayCard(Card card, CardZone targetZone)**: Plays a card from hand to a zone
- **ProcessCardEffects(Card card)**: Applies the effects of a played card

### Game Resolution
- **CheckWinConditions()**: Checks if any win conditions have been met
- **EndGame(Player winner)**: Concludes the game with a winner

### AI Management
- **ProcessAITurn(Player player)**: Handles AI player decision-making

## How This Class Interacts with Others

- **GameRulesInterpreter**: Uses rules to configure and govern gameplay
- **CardZone**: Creates and manages zones where cards exist
- **Card**: Creates, positions, and processes effects of cards
- **PlayerDeckManager**: Uses to create and manage player decks
- **CardImageLoader**: Indirectly used for loading card artwork

## Implementation Details

MainGame acts as the conductor of the entire system, ensuring all components work together according to the loaded game rules. It translates the abstract rules into concrete gameplay actions and manages the flow between players, turns, and phases.

The game loop follows these general steps:
1. Load rules and initialize game state
2. Create players, zones, and starting decks/hands
3. Begin the first player's turn
4. Process player actions within the turn
5. Check win conditions after significant events
6. When turn ends, move to next player
7. Continue until a win condition is met

For AI players, the system uses a simple decision-making algorithm to simulate play, though this could be extended with more sophisticated AI in the future.

## Best Practices

- The game should always be configured with valid rules before starting
- All card movements should be handled through appropriate methods (DrawCard, PlayCard, etc.)
- Zone access should use the GetPlayerZone helper method
- Game state should be checked regularly for win conditions
- AI processing should be done asynchronously via coroutines to avoid freezing

## Example Usage

MainGame typically runs this sequence:
1. On Start, it initializes a new game
2. It creates all necessary game elements based on the rules
3. It begins the first player's turn
4. It processes player input or AI decisions
5. It handles all card movements and effects
6. It checks win conditions after significant events
7. It manages turn transitions until the game ends

This central control allows the game engine to support various card games with different rules while maintaining consistent handling of core gameplay elements.
