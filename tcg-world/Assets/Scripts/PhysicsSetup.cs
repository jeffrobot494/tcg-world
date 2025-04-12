using UnityEngine;

/// <summary>
/// Sets up proper physics layers for interaction.
/// Attach to a GameObject in the scene.
/// </summary>
public class PhysicsSetup : MonoBehaviour
{
    // Layer constants
    private const int CARD_LAYER = 8;  // Unity's 8th layer
    private const int ZONE_LAYER = 9;  // Unity's 9th layer
    
    void Awake()
    {
        Debug.Log("[PHYSICS] PhysicsSetup.Awake called");
        
        // Create layer names if they don't exist
        CreateLayerNames();
        
        // Configure layer interactions early
        ConfigureLayerInteractions();
    }
    
    void Start()
    {
        Debug.Log("[PHYSICS] PhysicsSetup.Start called");
        
        // Ensure raycasts can hit cards and zones
        if (Camera.main != null)
        {
            int originalMask = Camera.main.cullingMask;
            Camera.main.cullingMask = Camera.main.cullingMask | (1 << CARD_LAYER) | (1 << ZONE_LAYER);
            Debug.Log($"[PHYSICS] Updated camera culling mask from {originalMask} to {Camera.main.cullingMask}");
        }
        else
        {
            Debug.LogError("[PHYSICS] Main camera is null! Cannot set culling mask.");
        }
        
        // Set all cards and zones to the appropriate layer
        SetLayersForGameObjects();
        
        // Verify settings are correct
        VerifyPhysicsSettings();
        
        Debug.Log("[PHYSICS] Physics setup complete");
    }
    
    private void CreateLayerNames()
    {
        // This only works in the editor, but it's a helpful reminder
        Debug.Log($"[PHYSICS] Make sure Unity has these layer names defined:");
        Debug.Log($"[PHYSICS] Layer {CARD_LAYER} should be named 'Card'");
        Debug.Log($"[PHYSICS] Layer {ZONE_LAYER} should be named 'Zone'");
    }
    
    private void ConfigureLayerInteractions()
    {
        Debug.Log("[PHYSICS] Configuring layer collision matrix");
        
        // Enable collision between cards and zones (needed for raycasting)
        Physics.IgnoreLayerCollision(CARD_LAYER, CARD_LAYER, false);
        Physics.IgnoreLayerCollision(ZONE_LAYER, ZONE_LAYER, false);
        Physics.IgnoreLayerCollision(CARD_LAYER, ZONE_LAYER, false);
        
        // Make sure queries hit triggers is enabled
        bool originalQueriesHitTriggers = Physics.queriesHitTriggers;
        Physics.queriesHitTriggers = true;
        Debug.Log($"[PHYSICS] Set Physics.queriesHitTriggers from {originalQueriesHitTriggers} to {Physics.queriesHitTriggers}");
        
        // Configure raycast mode
        Physics.defaultContactOffset = 0.01f; // Smaller contact offset for better precision
        Debug.Log($"[PHYSICS] Set Physics.defaultContactOffset to {Physics.defaultContactOffset}");
    }
    
    void SetLayersForGameObjects()
    {
        Debug.Log("[PHYSICS] Setting up layers for all game objects");
        
        // Set all cards to the card layer
        Card[] allCards = FindObjectsOfType<Card>();
        Debug.Log($"[PHYSICS] Found {allCards.Length} Card components");
        
        foreach (Card card in allCards)
        {
            // Capture original layer for logging
            int originalLayer = card.gameObject.layer;
            
            // Add extra check to log existing ClickableObject components
            ClickableObject existingClickable = card.GetComponent<ClickableObject>();
            if (existingClickable != null)
            {
                Debug.Log($"[PHYSICS] Card {card.cardName} already has ClickableObject component");
            }
            
            try
            {
                // Set the card layer
                card.gameObject.layer = CARD_LAYER;
                
                // Also set any child objects with colliders to the card layer
                Collider[] childColliders = card.GetComponentsInChildren<Collider>();
                foreach (Collider collider in childColliders)
                {
                    if (collider != null)
                    {
                        collider.gameObject.layer = CARD_LAYER;
                        Debug.Log($"[PHYSICS] Set child collider {collider.gameObject.name} to layer {CARD_LAYER}");
                    }
                }
                
                // Add a ClickableObject component if it doesn't have one
                if (existingClickable == null)
                {
                    ClickableObject newClickable = card.gameObject.AddComponent<ClickableObject>();
                    if (newClickable != null)
                    {
                        Debug.Log($"[PHYSICS] Added ClickableObject component to card {card.cardName}");
                    }
                    else
                    {
                        Debug.LogError($"[PHYSICS] Failed to add ClickableObject to {card.cardName}");
                    }
                }
                
                Debug.Log($"[PHYSICS] Set card {card.cardName} from layer {originalLayer} to layer {CARD_LAYER}");
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[PHYSICS] Error setting up card {card.cardName}: {ex.Message}");
            }
        }
        
        // Set all zones to the zone layer
        CardZone[] allZones = FindObjectsOfType<CardZone>();
        Debug.Log($"[PHYSICS] Found {allZones.Length} CardZone components");
        
        foreach (CardZone zone in allZones)
        {
            // Capture original layer for logging
            int originalLayer = zone.gameObject.layer;
            
            // Add extra check to log existing ClickableObject components
            ClickableObject existingClickable = zone.GetComponent<ClickableObject>();
            if (existingClickable != null)
            {
                Debug.Log($"[PHYSICS] Zone {zone.zoneName} already has ClickableObject component");
            }
            
            try
            {
                // Set the zone layer
                zone.gameObject.layer = ZONE_LAYER;
                
                // Also set any child objects with colliders to the zone layer
                Collider[] childColliders = zone.GetComponentsInChildren<Collider>();
                foreach (Collider collider in childColliders)
                {
                    if (collider != null)
                    {
                        collider.gameObject.layer = ZONE_LAYER;
                        Debug.Log($"[PHYSICS] Set child collider {collider.gameObject.name} to layer {ZONE_LAYER}");
                    }
                }
                
                // Add a ClickableObject component if it doesn't have one
                if (existingClickable == null)
                {
                    ClickableObject newClickable = zone.gameObject.AddComponent<ClickableObject>();
                    if (newClickable != null)
                    {
                        Debug.Log($"[PHYSICS] Added ClickableObject component to zone {zone.zoneName}");
                    }
                    else
                    {
                        Debug.LogError($"[PHYSICS] Failed to add ClickableObject to {zone.zoneName}");
                    }
                }
                
                Debug.Log($"[PHYSICS] Set zone {zone.zoneName} from layer {originalLayer} to layer {ZONE_LAYER}");
            }
            catch (System.Exception ex)
            {
                Debug.LogError($"[PHYSICS] Error setting up zone {zone.zoneName}: {ex.Message}");
            }
        }
    }
    
    private void VerifyPhysicsSettings()
    {
        Debug.Log("[PHYSICS] Verifying physics settings:");
        
        // Check layer collision matrix
        bool cardCardCollision = !Physics.GetIgnoreLayerCollision(CARD_LAYER, CARD_LAYER);
        bool zoneZoneCollision = !Physics.GetIgnoreLayerCollision(ZONE_LAYER, ZONE_LAYER);
        bool cardZoneCollision = !Physics.GetIgnoreLayerCollision(CARD_LAYER, ZONE_LAYER);
        
        Debug.Log($"[PHYSICS] Card-Card collision: {cardCardCollision}");
        Debug.Log($"[PHYSICS] Zone-Zone collision: {zoneZoneCollision}");
        Debug.Log($"[PHYSICS] Card-Zone collision: {cardZoneCollision}");
        
        // Check if all objects are on correct layers
        bool allCardsOnCorrectLayer = true;
        bool allZonesOnCorrectLayer = true;
        
        foreach (Card card in FindObjectsOfType<Card>())
        {
            if (card.gameObject.layer != CARD_LAYER)
            {
                Debug.LogError($"[PHYSICS] Card {card.cardName} is on layer {card.gameObject.layer} instead of {CARD_LAYER}!");
                allCardsOnCorrectLayer = false;
            }
        }
        
        foreach (CardZone zone in FindObjectsOfType<CardZone>())
        {
            if (zone.gameObject.layer != ZONE_LAYER)
            {
                Debug.LogError($"[PHYSICS] Zone {zone.zoneName} is on layer {zone.gameObject.layer} instead of {ZONE_LAYER}!");
                allZonesOnCorrectLayer = false;
            }
        }
        
        Debug.Log($"[PHYSICS] All cards on correct layer: {allCardsOnCorrectLayer}");
        Debug.Log($"[PHYSICS] All zones on correct layer: {allZonesOnCorrectLayer}");
        
        // Check physics settings
        Debug.Log($"[PHYSICS] Physics.queriesHitTriggers: {Physics.queriesHitTriggers}");
    }
}
