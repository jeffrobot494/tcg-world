using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Linq;
using UnityEngine.UI;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

/// <summary>
/// MainGame serves as the central controller for the Trading Card Game platform.
/// This script handles core game functionality, including turn management,
/// rule interpretation, and game state management.
/// </summary>
public class MainGame : MonoBehaviour
{
    // Singleton pattern for easy access
    public static MainGame Instance { get; private set; }
    
    // Game state
    [System.Serializable]
    public class Player
    {
        public int id;
        public string playerName;
        public bool isAI;
        public int currentResources;
        public int maxResources;
        public int health;
    }
    
    // Game configuration
    [Header("Game Setup")]
    public TextAsset gameRulesJson;
    public GameObject cardPrefab;
    public GameObject cardZonePrefab; // Prefab for creating card zones
    public Transform zonesContainer; // Parent transform for created zones
    public TextAsset cardListJson; // JSON file containing the card list
    
    // Player configuration
    [Header("Players")]
    public List<Player> players = new List<Player>();
    public int currentPlayerIndex = 0;
    
    // Game state
    private bool gameInProgress = false;
    private int turnNumber = 0;
    private string currentPhase = "";
    private Dictionary<string, CardZone> zonesByName = new Dictionary<string, CardZone>();
    
    // Reference to the rules interpreter
    private GameRulesInterpreter rulesInterpreter;
    
    // Initialize the singleton
    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
        }
        
        // Find or create the rules interpreter
        rulesInterpreter = FindObjectOfType<GameRulesInterpreter>();
        if (rulesInterpreter == null)
        {
            GameObject interpreterObj = new GameObject("Rules Interpreter");
            rulesInterpreter = interpreterObj.AddComponent<GameRulesInterpreter>();
        }
    }
    
    // Start is called before the first frame update
    void Start()
    {
        InitializeGame();
    }
    
    // Initialize the game with the current rules
    private void InitializeGame()
    {
        Debug.Log("Initializing game...");
        
        // Load game rules from JSON
        if (gameRulesJson != null)
        {
            bool rulesLoaded = rulesInterpreter.LoadRules(gameRulesJson);
            if (!rulesLoaded)
            {
                Debug.LogError("Failed to load game rules!");
                return;
            }
        }
        else
        {
            Debug.LogError("No game rules JSON assigned!");
            return;
        }
        
        // Set up players based on rules
        SetupPlayers();
        
        // Create card zones based on rules
        CreateCardZones();
        
        // Initialize player decks, hands, etc.
        InitializePlayerCards();
        
        // Game is ready to start
        gameInProgress = true;
        turnNumber = 1;
        currentPlayerIndex = 0;
        
        // Start first turn
        BeginTurn(players[currentPlayerIndex]);
    }
    
    // Set up players with initial state from rules
    private void SetupPlayers()
    {
        // Clear existing players if any
        players.Clear();
        
        // Get player count from rules
        int playerCount = rulesInterpreter.GameInfo["playerCount"].Value<int>();
        int initialHealth = rulesInterpreter.GameInfo["initialPlayerHealth"].Value<int>();
        
        // Create players
        for (int i = 0; i < playerCount; i++)
        {
            Player player = new Player
            {
                id = i + 1,
                playerName = i == 0 ? "Player" : $"Opponent {i}",
                isAI = i != 0, // First player is human, others are AI
                currentResources = rulesInterpreter.GetStartingResources(),
                maxResources = rulesInterpreter.GetStartingResources(),
                health = initialHealth
            };
            
            players.Add(player);
            Debug.Log($"Player {player.playerName} initialized with {player.health} health and {player.currentResources} resources.");
        }
    }
    
    // Create card zones based on the rules
    private void CreateCardZones()
    {
        // Clear existing zones dictionary
        zonesByName.Clear();
        
        // Ensure we have a container for zones
        if (zonesContainer == null)
        {
            GameObject container = new GameObject("Card Zones");
            zonesContainer = container.transform;
        }
        
        // Get zones from rules
        JArray zoneDefinitions = rulesInterpreter.Zones;
        
        foreach (JObject zoneDef in zoneDefinitions)
        {
            string zoneName = zoneDef["name"].ToString();
            bool perPlayer = zoneDef["perPlayer"].Value<bool>();
            bool isPublic = zoneDef["isPublic"].Value<bool>();
            bool isOrdered = zoneDef["isOrdered"].Value<bool>();
            int maxCards = zoneDef["maxCards"].Value<int>();
            
            if (perPlayer)
            {
                // Create a zone instance for each player
                foreach (Player player in players)
                {
                    CreateZoneForPlayer(zoneName, player, isPublic, isOrdered, maxCards);
                }
            }
            else
            {
                // Create a single shared zone
                CreateZoneForPlayer(zoneName, null, isPublic, isOrdered, maxCards);
            }
        }
        
        Debug.Log($"Created {zonesByName.Count} card zones based on rules.");
    }
    
    // Create a single zone for a player (or shared if player is null)
    private void CreateZoneForPlayer(string zoneName, Player player, bool isPublic, bool isOrdered, int maxCards)
    {
        // Create a unique name for this zone instance
        string uniqueZoneName = player != null ? $"{zoneName}_{player.id}" : zoneName;
        
        // Create a game object for the zone
        GameObject zoneObj;
        
        if (cardZonePrefab != null)
        {
            zoneObj = Instantiate(cardZonePrefab, zonesContainer);
        }
        else
        {
            zoneObj = new GameObject(uniqueZoneName);
            zoneObj.transform.SetParent(zonesContainer);
        }
        
        zoneObj.name = uniqueZoneName;
        
        // Add and configure the CardZone component
        CardZone zoneComponent = zoneObj.GetComponent<CardZone>();
        if (zoneComponent == null)
        {
            zoneComponent = zoneObj.AddComponent<CardZone>();
        }
        
        // Configure the zone
        zoneComponent.zoneName = zoneName;
        zoneComponent.ownerPlayerId = player?.id ?? 0;
        zoneComponent.isPublic = isPublic;
        zoneComponent.isOrderable = isOrdered;
        zoneComponent.maxCapacity = maxCards;
        
        // Configure zone layout based on zone type
        ConfigureZoneLayout(zoneComponent, zoneName, player);
        
        // Store in dictionary for easy lookup
        zonesByName[uniqueZoneName] = zoneComponent;
    }
    
    // Configure the visual layout of a zone
    private void ConfigureZoneLayout(CardZone zone, string zoneName, Player player)
    {
        // Set default values
        zone.layoutOrigin = Vector3.zero;
        zone.layoutDirection = Vector3.right;
        zone.cardSpacing = 0.3f;
        
        // Configure based on zone type and player
        switch (zoneName)
        {
            case "Deck":
                zone.faceUp = false;
                zone.layoutDirection = new Vector3(0.05f, 0.05f, -0.05f); // Stacked
                zone.cardSpacing = 0.02f;
                
                // Position based on player
                if (player != null)
                {
                    if (player.id == 1) // Human player
                    {
                        zone.layoutOrigin = new Vector3(-7, 0, -3);
                    }
                    else // AI player
                    {
                        zone.layoutOrigin = new Vector3(7, 0, 3);
                    }
                }
                break;
                
            case "Hand":
                zone.faceUp = player != null && player.id == 1; // Only show human player's hand
                zone.layoutDirection = Vector3.right;
                zone.cardSpacing = 0.7f;
                
                // Position based on player
                if (player != null)
                {
                    if (player.id == 1) // Human player
                    {
                        zone.layoutOrigin = new Vector3(-4, 0, -4);
                        zone.defaultRotation = new Vector3(30, 0, 0);
                    }
                    else // AI player
                    {
                        zone.layoutOrigin = new Vector3(-4, 0, 4);
                        zone.defaultRotation = new Vector3(-30, 0, 0);
                    }
                }
                break;
                
            case "Field":
                zone.faceUp = true;
                zone.layoutDirection = Vector3.right;
                zone.cardSpacing = 1.2f;
                
                // Position based on player
                if (player != null)
                {
                    if (player.id == 1) // Human player
                    {
                        zone.layoutOrigin = new Vector3(-4, 0, -2);
                    }
                    else // AI player
                    {
                        zone.layoutOrigin = new Vector3(-4, 0, 2);
                    }
                }
                break;
                
            case "Discard":
                zone.faceUp = true;
                zone.layoutDirection = new Vector3(0.1f, 0.1f, -0.05f); // Slightly spread
                zone.cardSpacing = 0.05f;
                
                // Position based on player
                if (player != null)
                {
                    if (player.id == 1) // Human player
                    {
                        zone.layoutOrigin = new Vector3(7, 0, -3);
                    }
                    else // AI player
                    {
                        zone.layoutOrigin = new Vector3(-7, 0, 3);
                    }
                }
                break;
                
            default:
                // Default layout for other zones
                zone.faceUp = true;
                zone.layoutDirection = Vector3.right;
                zone.cardSpacing = 0.5f;
                break;
        }
    }
    
    // Initialize player cards (decks, hands, etc.)
    private void InitializePlayerCards()
    {
        // Get or create the PlayerDeckManager
        PlayerDeckManager deckManager = GetOrCreateDeckManager();
        
        foreach (Player player in players)
        {
            // Get the player's deck zone
            string deckZoneName = $"Deck_{player.id}";
            if (zonesByName.TryGetValue(deckZoneName, out CardZone deckZone))
            {
                // Create a random deck for the player
                List<PlayerDeckManager.CardData> playerDeck = deckManager.CreateRandomDeck(player.id, 30);
                
                // Populate the deck zone with cards
                deckManager.PopulateZoneWithDeck(playerDeck, deckZone, cardPrefab);
                
                // Shuffle the deck
                deckZone.ShuffleCards();
                
                // Draw starting hand
                string handZoneName = $"Hand_{player.id}";
                if (zonesByName.TryGetValue(handZoneName, out CardZone handZone))
                {
                    // Determine starting hand size
                    int startingHandSize = player.id == 1 ? 
                        rulesInterpreter.TurnStructure["firstPlayerDraws"].Value<int>() :
                        rulesInterpreter.TurnStructure["firstPlayerDraws"].Value<int>() + 1;
                        
                    // Draw cards
                    for (int i = 0; i < startingHandSize; i++)
                    {
                        Card card = deckZone.DrawCard();
                        if (card != null)
                        {
                            handZone.AddCard(card);
                        }
                    }
                }
            }
        }
    }
    
    // Find or create the PlayerDeckManager
    private PlayerDeckManager GetOrCreateDeckManager()
    {
        PlayerDeckManager deckManager = FindObjectOfType<PlayerDeckManager>();
        if (deckManager == null)
        {
            GameObject deckManagerObj = new GameObject("Deck Manager");
            deckManager = deckManagerObj.AddComponent<PlayerDeckManager>();
            
            // If we have a direct reference to the card list JSON, assign it
            if (cardListJson != null)
            {
                deckManager.cardsJsonFile = cardListJson;
            }
        }
        return deckManager;
    }
    
    // Begin a player's turn
    private void BeginTurn(Player player)
    {
        Debug.Log($"Beginning turn {turnNumber} for player {player.playerName}");
        
        // Update resources according to the rules
        player.maxResources = Mathf.Min(
            player.maxResources + rulesInterpreter.GetResourcesPerTurn(),
            rulesInterpreter.GetMaxResources()
        );
        player.currentResources = player.maxResources;
        
        // Draw cards for the player
        int drawCount = rulesInterpreter.TurnStructure["normalDrawCount"].Value<int>();
        for (int i = 0; i < drawCount; i++)
        {
            DrawCardForPlayer(player);
        }
        
        // Get the first phase from the rules
        JArray phases = (JArray)rulesInterpreter.TurnStructure["phases"];
        if (phases != null && phases.Count > 0)
        {
            BeginPhase(phases[0]["name"].ToString());
        }
        else
        {
            BeginPhase("Main"); // Default if no phases defined
        }
        
        // If this is an AI player, process their turn
        if (player.isAI)
        {
            StartCoroutine(ProcessAITurn(player));
        }
    }
    
    // Process an AI player's turn
    private IEnumerator ProcessAITurn(Player player)
    {
        Debug.Log($"AI player {player.playerName} is thinking...");
        
        // Wait a bit to simulate thinking
        yield return new WaitForSeconds(1.0f);
        
        // Get the AI's hand
        CardZone handZone = GetPlayerZone(player, "Hand");
        CardZone fieldZone = GetPlayerZone(player, "Field");
        
        if (handZone != null && fieldZone != null)
        {
            // Get playable cards (cost <= current resources)
            List<Card> playableCards = new List<Card>();
            foreach (Card card in handZone.Cards)
            {
                if (card.cost <= player.currentResources)
                {
                    playableCards.Add(card);
                }
            }
            
            // Sort by cost (highest first) for simple AI strategy
            playableCards.Sort((a, b) => b.cost.CompareTo(a.cost));
            
            // Play cards until out of resources or playable cards
            foreach (Card card in playableCards)
            {
                if (card.cost <= player.currentResources)
                {
                    // Wait a bit between plays
                    yield return new WaitForSeconds(0.5f);
                    
                    // Play the card
                    PlayCard(card, fieldZone);
                }
            }
        }
        
        // End the turn
        yield return new WaitForSeconds(1.0f);
        EndTurn();
    }
    
    // End the current player's turn
    public void EndTurn()
    {
        // Advance to next player
        currentPlayerIndex = (currentPlayerIndex + 1) % players.Count;
        
        // If we've gone through all players, advance the turn number
        if (currentPlayerIndex == 0)
        {
            turnNumber++;
        }
        
        // Begin the next player's turn
        BeginTurn(players[currentPlayerIndex]);
    }
    
    // Begin a game phase
    private void BeginPhase(string phaseName)
    {
        currentPhase = phaseName;
        Debug.Log($"Beginning {phaseName} phase");
        
        // Handle phase-specific logic
        // This would be driven by the rules in a full implementation
    }
    
    // Draw a card for the specified player
    private void DrawCardForPlayer(Player player)
    {
        // Get the player's deck and hand zones
        CardZone deckZone = GetPlayerZone(player, "Deck");
        CardZone handZone = GetPlayerZone(player, "Hand");
        
        if (deckZone == null || handZone == null)
        {
            Debug.LogError($"Could not find deck or hand for player {player.playerName}");
            return;
        }
        
        // Check if hand is at capacity
        if (handZone.Cards.Count >= handZone.maxCapacity && handZone.maxCapacity > 0)
        {
            Debug.Log($"Player {player.playerName}'s hand is full!");
            return;
        }
        
        // Draw a card from deck to hand
        Card card = deckZone.DrawCard();
        if (card != null)
        {
            handZone.AddCard(card);
            Debug.Log($"Player {player.playerName} drew a card: {card.cardName}");
        }
        else
        {
            // Handle empty deck according to rules
            Debug.Log($"Player {player.playerName}'s deck is empty!");
            
            // Check if deck depletion is a loss condition
            foreach (JObject condition in rulesInterpreter.WinConditions)
            {
                if (condition["type"].ToString() == "deckDepletion")
                {
                    // Opponent wins (or in multiplayer, player loses)
                    Player winner = players.FirstOrDefault(p => p.id != player.id);
                    if (winner != null)
                    {
                        EndGame(winner);
                    }
                    return;
                }
            }
        }
    }
    
    // Play a card from hand to the appropriate zone
    public void PlayCard(Card card, CardZone targetZone)
    {
        Player currentPlayer = players[currentPlayerIndex];
        
        // Check if it's the right player's turn
        if (card.ownerPlayerId != currentPlayer.id)
        {
            Debug.LogWarning("You can't play a card that doesn't belong to you!");
            return;
        }
        
        // Check if player has enough resources
        if (currentPlayer.currentResources < card.cost)
        {
            Debug.LogWarning("Not enough resources to play this card!");
            return;
        }
        
        // Check if current phase allows playing cards
        if (!IsActionAllowedInCurrentPhase("playCard"))
        {
            Debug.LogWarning("You can't play cards in this phase!");
            return;
        }
        
        // Get the player's hand
        CardZone handZone = GetPlayerZone(currentPlayer, "Hand");
        if (handZone == null || !handZone.Cards.Contains(card))
        {
            Debug.LogError("Card not found in player's hand!");
            return;
        }
        
        // Remove card from hand
        handZone.RemoveCard(card);
        
        // Add card to target zone
        targetZone.AddCard(card);
        
        // Deduct resources
        currentPlayer.currentResources -= card.cost;
        
        Debug.Log($"Player {currentPlayer.playerName} played {card.cardName}");
        
        // Process card effects - would be handled by the rule interpreter
        ProcessCardEffects(card);
        
        // Check win conditions after card play
        CheckWinConditions();
    }
    
    // Check if an action is allowed in the current phase
    private bool IsActionAllowedInCurrentPhase(string action)
    {
        return rulesInterpreter.IsActionAllowedInPhase(action, currentPhase);
    }
    
    // Get a player's zone by name
    private CardZone GetPlayerZone(Player player, string zoneName)
    {
        string key = $"{zoneName}_{player.id}";
        if (zonesByName.TryGetValue(key, out CardZone zone))
        {
            return zone;
        }
        return null;
    }
    
    // Process card effects based on the rule system
    private void ProcessCardEffects(Card card)
    {
        // This would interpret effects based on the game rules
        Debug.Log($"Processing effects for {card.cardName}");
        
        // For now, just a placeholder
        // In a full implementation, this would use the rules to determine effects
    }
    
    // Check for win conditions
    private void CheckWinConditions()
    {
        foreach (JObject condition in rulesInterpreter.WinConditions)
        {
            string type = condition["type"].ToString();
            
            switch (type)
            {
                case "healthReduction":
                    // Check if any player's health is at or below the threshold
                    int threshold = condition["threshold"].Value<int>();
                    foreach (Player player in players)
                    {
                        if (player.health <= threshold)
                        {
                            Player winner = players.FirstOrDefault(p => p.id != player.id);
                            if (winner != null)
                            {
                                EndGame(winner);
                                return;
                            }
                        }
                    }
                    break;
                
                // Add other win condition types as needed
            }
        }
    }
    
    // End the game with a winner
    private void EndGame(Player winner)
    {
        gameInProgress = false;
        Debug.Log($"Game over! {winner.playerName} wins!");
        
        // Handle end game logic, UI, etc.
    }
    
    // Update is called once per frame
    void Update()
    {
        // Main game loop logic would go here
        // For example, handling input, animations, etc.
    }
}
