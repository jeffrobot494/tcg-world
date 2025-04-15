# TCG World Architecture Proposal - Simplified

## Core Architecture Principles

1. **Separation of Concerns**
   - Split data, logic, and presentation
   - Each component has a single, clear responsibility
   - Minimize dependencies between systems

2. **Clean Data Flow**
   - Strongly-typed models from the start
   - Data transformation at boundaries only
   - Consistent state management

3. **Unity Best Practices**
   - Proper use of MonoBehaviour lifecycle
   - ScriptableObject singletons for services
   - Minimal UI for initial implementation

4. **Simplicity First**
   - Immediate state changes (no animations)
   - Single player support initially
   - Extensive logging for debugging

## Architecture Layers

### 1. Data Layer

The foundation of our system, focused on representing game entities.

#### Core Data Models

```csharp
// Game rules model - strongly typed version of JSON
public class GameRules
{
    public GameInfo Info { get; set; }
    public List<ZoneDefinition> Zones { get; set; }
    public TurnStructure TurnStructure { get; set; }
    public List<WinCondition> WinConditions { get; set; }
    // etc.
}

// Card definition (template for cards)
public class CardDefinition
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public int Cost { get; set; }
    public int Attack { get; set; }
    public int Health { get; set; }
    public string Description { get; set; }
    public string ArtworkUrl { get; set; }
    public List<string> Tags { get; set; }
    public Dictionary<string, object> CustomProperties { get; set; }
}

// Runtime representation of a card in play
public class CardData
{
    public CardDefinition Definition { get; }
    public int InstanceId { get; }
    public int OwnerId { get; }
    public bool IsFaceUp { get; set; }
    public CardZoneData CurrentZone { get; set; }
    
    // Copies properties from definition but allows runtime changes
    public int CurrentAttack { get; set; }
    public int CurrentHealth { get; set; }
    
    public CardData(CardDefinition definition, int instanceId, int ownerId)
    {
        Definition = definition;
        InstanceId = instanceId;
        OwnerId = ownerId;
        
        // Initialize with base values
        CurrentAttack = definition.Attack;
        CurrentHealth = definition.Health;
    }
}
```

#### Data Access

```csharp
// Handles loading and parsing JSON data
public class DataLoader
{
    public GameRules LoadGameRules(TextAsset rulesJson)
    {
        // Directly deserialize to our model class
        return JsonUtility.FromJson<GameRules>(rulesJson.text);
    }
    
    public List<CardDefinition> LoadCardDefinitions(TextAsset cardsJson)
    {
        // Deserialize directly to our model
        CardCollection collection = JsonUtility.FromJson<CardCollection>(cardsJson.text);
        return collection.Cards;
    }
}
```

### 2. Service Layer

Coordinates game systems and manages application logic.

#### Core Services

```csharp
// Central game coordinator - using ScriptableObject singleton
[CreateAssetMenu(fileName = "GameManager", menuName = "TCG/Game Manager")]
public class GameManager : ScriptableObject
{
    // References to other services
    public CardService CardService;
    public ZoneService ZoneService;
    
    // Game state
    private GameRules gameRules;
    private List<CardDefinition> cardDefinitions;
    private Player player;
    private string currentPhase = "Main"; // Single phase initially
    
    public void Initialize(TextAsset rulesJson, TextAsset cardsJson)
    {
        Debug.Log("GameManager: Initializing");
        
        // Initialize game data
        DataLoader dataLoader = new DataLoader();
        gameRules = dataLoader.LoadGameRules(rulesJson);
        cardDefinitions = dataLoader.LoadCardDefinitions(cardsJson);
        
        // Set up player and game state
        InitializePlayer();
        CreateZones();
        SetupInitialDeck();
        StartGame();
        
        Debug.Log("GameManager: Initialization complete");
    }
    
    private void InitializePlayer() 
    { 
        player = new Player(1, "Player", gameRules.Info.InitialPlayerHealth);
        Debug.Log($"GameManager: Player initialized with {player.Health} health");
    }
    
    private void CreateZones() 
    { 
        foreach (var zoneDef in gameRules.Zones)
        {
            ZoneService.CreateZone(zoneDef, player.Id);
            Debug.Log($"GameManager: Created zone {zoneDef.Name}");
        }
    }
    
    private void SetupInitialDeck() 
    { 
        // Create 10 random cards for simplicity
        for (int i = 0; i < 10; i++)
        {
            int randomIndex = Random.Range(0, cardDefinitions.Count);
            CardData card = CardService.CreateCard(cardDefinitions[randomIndex], player.Id);
            Debug.Log($"GameManager: Created card {card.Definition.Name}");
        }
    }
    
    private void StartGame() 
    { 
        Debug.Log("GameManager: Game started");
    }
    
    // Game flow methods - simplified to a single phase
    public void EndTurn()
    {
        Debug.Log("GameManager: Turn ended");
        
        // For single player, just refresh resources and draw a card
        player.RefreshResources();
        CardService.DrawCard(player.Id);
        
        Debug.Log("GameManager: New turn started");
    }
    
    // Game state queries
    public Player GetPlayer() => player;
    public string GetCurrentPhase() => currentPhase;
    public bool CanPlayCard(CardData card) => player.CurrentResources >= card.Definition.Cost;
}

// Manages card creation and state - ScriptableObject singleton
[CreateAssetMenu(fileName = "CardService", menuName = "TCG/Card Service")]
public class CardService : ScriptableObject
{
    // Reference to prefab - assigned in the inspector
    public GameObject CardPrefab;
    
    // Reference to other services
    public ZoneService ZoneService;
    
    private Dictionary<int, CardData> cardDataById = new Dictionary<int, CardData>();
    private Dictionary<int, CardView> cardViewsById = new Dictionary<int, CardView>();
    private int nextCardId = 1;
    
    public CardData CreateCard(CardDefinition definition, int ownerId)
    {
        Debug.Log($"CardService: Creating card {definition.Name}");
        
        // Create a unique instance ID for this card
        int instanceId = nextCardId++;
        
        // Create the card data
        CardData cardData = new CardData(definition, instanceId, ownerId);
        cardDataById[instanceId] = cardData;
        
        // Create the visual representation
        GameObject cardObject = Instantiate(CardPrefab);
        CardView cardView = cardObject.GetComponent<CardView>();
        
        // Connect data to view
        cardView.Initialize(cardData);
        cardViewsById[instanceId] = cardView;
        
        // Add to deck zone by default
        ZoneData deckZone = ZoneService.GetPlayerZone(ownerId, "Deck");
        MoveCard(cardData.InstanceId, deckZone.Id);
        
        Debug.Log($"CardService: Card {definition.Name} (ID: {instanceId}) created and added to deck");
        
        return cardData;
    }
    
    public void MoveCard(int cardId, int zoneId)
    {
        CardData cardData = cardDataById[cardId];
        CardView cardView = cardViewsById[cardId];
        ZoneData zoneData = ZoneService.GetZoneById(zoneId);
        
        Debug.Log($"CardService: Moving card {cardData.Definition.Name} to zone {zoneData.Definition.Name}");
        
        // Update data
        ZoneData oldZone = cardData.CurrentZone;
        cardData.CurrentZone = zoneData;
        
        // Update visual position - immediate position change
        cardView.MoveToZone(zoneData);
        
        Debug.Log($"CardService: Card {cardData.Definition.Name} moved from {(oldZone?.Definition.Name ?? "null")} to {zoneData.Definition.Name}");
    }
    
    public void DrawCard(int playerId)
    {
        // Get zones
        ZoneData deckZone = ZoneService.GetPlayerZone(playerId, "Deck");
        ZoneData handZone = ZoneService.GetPlayerZone(playerId, "Hand");
        
        // Get first card in deck (if any)
        CardData cardToDraw = null;
        foreach (var card in cardDataById.Values)
        {
            if (card.CurrentZone == deckZone)
            {
                cardToDraw = card;
                break;
            }
        }
        
        if (cardToDraw != null)
        {
            // Move card from deck to hand
            MoveCard(cardToDraw.InstanceId, handZone.Id);
            Debug.Log($"CardService: Drew card {cardToDraw.Definition.Name}");
        }
        else
        {
            Debug.Log("CardService: No cards left in deck");
        }
    }
    
    public void PlayCard(int cardId, int targetZoneId)
    {
        CardData cardData = cardDataById[cardId];
        
        Debug.Log($"CardService: Playing card {cardData.Definition.Name}");
        
        // Deduct resources (assuming we checked if playable already)
        Player player = GameManager.Instance.GetPlayer();
        player.CurrentResources -= cardData.Definition.Cost;
        
        // Move to target zone
        MoveCard(cardId, targetZoneId);
        
        Debug.Log($"CardService: Card {cardData.Definition.Name} played. Player has {player.CurrentResources} resources left");
    }
}

// Manages zones and their layout - ScriptableObject singleton
[CreateAssetMenu(fileName = "ZoneService", menuName = "TCG/Zone Service")]
public class ZoneService : ScriptableObject
{
    // Reference to prefab - assigned in the inspector
    public GameObject ZonePrefab;
    
    private Dictionary<int, ZoneData> zoneDataById = new Dictionary<int, ZoneData>();
    private Dictionary<int, ZoneView> zoneViewsById = new Dictionary<int, ZoneView>();
    private Dictionary<string, Dictionary<int, ZoneData>> playerZonesByName = new Dictionary<string, Dictionary<int, ZoneData>>();
    private int nextZoneId = 1;
    
    public ZoneData CreateZone(ZoneDefinition definition, int ownerId)
    {
        Debug.Log($"ZoneService: Creating zone {definition.Name} for player {ownerId}");
        
        int zoneId = nextZoneId++;
        
        ZoneData zoneData = new ZoneData(definition, zoneId, ownerId);
        zoneDataById[zoneId] = zoneData;
        
        // Create view
        GameObject zoneObject = Instantiate(ZonePrefab);
        ZoneView zoneView = zoneObject.GetComponent<ZoneView>();
        zoneView.Initialize(zoneData);
        zoneViewsById[zoneId] = zoneView;
        
        // Add to player zones lookup
        if (!playerZonesByName.ContainsKey(definition.Name))
        {
            playerZonesByName[definition.Name] = new Dictionary<int, ZoneData>();
        }
        playerZonesByName[definition.Name][ownerId] = zoneData;
        
        Debug.Log($"ZoneService: Zone {definition.Name} created with ID {zoneId}");
        
        return zoneData;
    }
    
    public ZoneData GetZoneById(int zoneId)
    {
        return zoneDataById[zoneId];
    }
    
    public ZoneView GetZoneViewById(int zoneId)
    {
        return zoneViewsById[zoneId];
    }
    
    public ZoneData GetPlayerZone(int playerId, string zoneName)
    {
        if (playerZonesByName.TryGetValue(zoneName, out var playerZones))
        {
            if (playerZones.TryGetValue(playerId, out var zone))
            {
                return zone;
            }
        }
        
        Debug.LogError($"ZoneService: Zone {zoneName} not found for player {playerId}");
        return null;
    }
}
```

### 3. View Layer

Handles visual representation of game elements.

#### Core Views

```csharp
// Displays a card
public class CardView : MonoBehaviour
{
    [SerializeField] private SpriteRenderer artworkRenderer;
    [SerializeField] private TextMeshPro nameText;
    [SerializeField] private TextMeshPro costText;
    [SerializeField] private TextMeshPro attackText;
    [SerializeField] private TextMeshPro healthText;
    
    private CardData cardData;
    
    public void Initialize(CardData data)
    {
        Debug.Log($"CardView: Initializing view for card {data.Definition.Name}");
        cardData = data;
        UpdateVisuals();
        LoadCardArtwork();
    }
    
    public void UpdateVisuals()
    {
        nameText.text = cardData.Definition.Name;
        costText.text = cardData.Definition.Cost.ToString();
        attackText.text = cardData.CurrentAttack.ToString();
        healthText.text = cardData.CurrentHealth.ToString();
        
        Debug.Log($"CardView: Updated visuals for card {cardData.Definition.Name}");
    }
    
    private void LoadCardArtwork()
    {
        // For simplicity, just use a placeholder sprite initially
        // We'll add proper image loading later
        Debug.Log($"CardView: Loading artwork for card {cardData.Definition.Name}");
    }
    
    public void MoveToZone(ZoneData zone)
    {
        Debug.Log($"CardView: Moving card {cardData.Definition.Name} to zone {zone.Definition.Name}");
        
        // Get position from ZoneView - no animations, just set position directly
        ZoneView zoneView = ZoneService.Instance.GetZoneViewById(zone.Id);
        Transform targetTransform = zoneView.GetNextCardPosition();
        
        // Set position and rotation immediately
        transform.position = targetTransform.position;
        transform.rotation = targetTransform.rotation;
        transform.SetParent(targetTransform);
        
        Debug.Log($"CardView: Card {cardData.Definition.Name} positioned in zone {zone.Definition.Name}");
    }
}

// Handles zone visualization and layout
public class ZoneView : MonoBehaviour
{
    [SerializeField] private Transform cardsParent;
    [SerializeField] private Vector3 firstCardPosition = Vector3.zero;
    [SerializeField] private Vector3 cardSpacing = new Vector3(1.2f, 0, 0);
    [SerializeField] private int maxCardsPerRow = 7;
    [SerializeField] private Vector3 rowSpacing = new Vector3(0, 0, 1.5f);
    
    private ZoneData zoneData;
    private List<Transform> occupiedPositions = new List<Transform>();
    
    public void Initialize(ZoneData data)
    {
        Debug.Log($"ZoneView: Initializing view for zone {data.Definition.Name}");
        zoneData = data;
        
        // Set name for easier debugging
        gameObject.name = $"Zone_{data.Definition.Name}_{data.OwnerId}";
    }
    
    public Transform GetNextCardPosition()
    {
        int cardCount = occupiedPositions.Count;
        int row = cardCount / maxCardsPerRow;
        int column = cardCount % maxCardsPerRow;
        
        Vector3 position = firstCardPosition + 
            (cardSpacing * column) + 
            (rowSpacing * row);
            
        GameObject positionMarker = new GameObject($"Position_{cardCount}");
        positionMarker.transform.parent = cardsParent;
        positionMarker.transform.localPosition = position;
        positionMarker.transform.localRotation = Quaternion.Euler(90, 0, 0); // X,Z plane
        
        occupiedPositions.Add(positionMarker.transform);
        
        Debug.Log($"ZoneView: Created position marker at {position} in zone {zoneData.Definition.Name}");
        return positionMarker.transform;
    }
}
```

## Prefab Structure

### Card Prefab

A properly structured card prefab with clear hierarchy:

```
Card (GameObject)
├── CardView (Script)
├── BoxCollider (For interaction - disabled initially)
├── Artwork (SpriteRenderer)
└── TextElements (Child GameObject)
    ├── NameText (TextMeshPro)
    ├── CostText (TextMeshPro)
    ├── AttackText (TextMeshPro)
    └── HealthText (TextMeshPro)
```

### Zone Prefab

Simple zone representation:

```
Zone (GameObject)
├── ZoneView (Script)
├── BoxCollider (Flat on X,Z plane - disabled initially)
├── Visual (Quad or Sprite for zone boundary)
└── CardPositions (Empty parent for position markers)
```

## Implementation Strategy

1. **First Phase: Card Rendering**
   - Create data models
   - Create basic card prefab that renders correctly
   - Set up zones with appropriate positioning
   - Focus on getting cards displayed properly in the correct orientation

2. **Second Phase: Basic Turn Structure**
   - Add simple "draw card" and "play card" functionality
   - Implement one-player turn structure
   - Add resource system
   - Create minimal UI for turn actions

3. **Third Phase: Interaction**
   - Enable colliders for clicking
   - Implement card selection and targeting
   - Add basic card play validation

## Key Advantages of This Simplified Approach

1. **Faster Implementation**
   - Focus on core functionality first
   - Immediate state changes without animations
   - Single player simplifies logic

2. **Better Debugging**
   - Extensive logging throughout
   - ScriptableObject services are easy to inspect
   - Clean separation of concerns

3. **Clear Path Forward**
   - Solid foundation that can be extended later
   - Proper data structures from the beginning
   - Easy to add more features once basics work

## Getting Started

1. Create the ScriptableObject assets (GameManager, CardService, ZoneService)
2. Create a simple test scene with a main camera
3. Set up card prefab with correct scale and orientation
4. Set up zone prefab with proper collider configuration
5. Implement zone positioning and verify it works
6. Test card creation and verify cards appear correctly
7. Add card movement between zones
8. Create minimal playtest UI

This simplified architecture focuses on getting cards to render correctly first, before adding game logic and interaction. The extensive logging will help track down any issues with card positioning or scaling.