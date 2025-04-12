using System.Collections;
using System.Collections.Generic;
using UnityEngine;
// UI imports removed
using TCGWorld.Interfaces;

/// <summary>
/// Represents a single card in the Trading Card Game.
/// This class stores all the information about a card, including its attributes, effects,
/// and visual representation.
/// </summary>
public class Card : MonoBehaviour, ICard
{
    // Core card information
    public int id;
    public string cardName;
    public string description;
    
    // Visuals
    private Sprite _artwork;
    public Sprite artwork
    {
        get { return _artwork; }
        set 
        { 
            _artwork = value; 
            ApplyArtwork();
        }
    }
    
    // ICard interface implementation - map to existing properties
    public int ID => id;
    public string Name => cardName;
    public string Description => description;
    public int OwnerID => ownerPlayerId;
    public bool IsFaceUp => isFaceUp;
    
    // ICard.Artwork implementation
    public Sprite Artwork 
    {
        get { return artwork; }
        set { artwork = value; }
    }
    
    // Game properties (these could vary by game type)
    public int cost;
    public int attack;
    public int health;
    public string cardType; // e.g., "Creature", "Spell", "Item"
    public List<string> tags = new List<string>(); // For categorization
    
    // Current state
    public bool isFaceUp = false;
    public bool isInteractable = true; // Set to true by default
    
    // Runtime references
    public CardZone currentZone;
    public int ownerPlayerId;
    
    // Collider for mouse interaction (can be BoxCollider or MeshCollider)
    private Collider cardCollider;
    
    // ICard interface implementation
    public ICardContainer CurrentContainer 
    { 
        get { return currentZone; } 
        set { currentZone = value as CardZone; } 
    }
    
    // UI Components have been removed
    // Card visuals are now handled through CardVisuals component and 3D objects
    
    // Visual transform data
    private Vector3 targetPosition;
    private Quaternion targetRotation;
    private Vector3 targetScale;
    private float moveSpeed = 5f;
    
    // Methods for card behavior - implementing ICard interface
    public void FlipCard(bool faceUp)
    {
        isFaceUp = faceUp;
        
        // Update visuals to show correct card face
        CardVisuals cardVisuals = GetComponent<CardVisuals>();
        if (cardVisuals != null)
        {
            cardVisuals.RefreshVisuals();
        }
        
        // Animation to flip the card - adjusted for X,Z plane orientation
        if (isFaceUp)
        {
            // Animate from back to front
            // For cards on X,Z plane (rotated 90 degrees on X), we need to flip around Z axis
            StartCoroutine(AnimateFlip(new Vector3(90, 0, 180), new Vector3(90, 0, 0)));
        }
        else
        {
            // Animate from front to back
            StartCoroutine(AnimateFlip(new Vector3(90, 0, 0), new Vector3(90, 0, 180)));
        }
    }
    
    // Coroutine to animate card flipping
    private IEnumerator AnimateFlip(Vector3 startRotation, Vector3 endRotation)
    {
        float duration = 0.3f;
        float timeElapsed = 0;
        
        Quaternion startQuaternion = Quaternion.Euler(startRotation);
        Quaternion endQuaternion = Quaternion.Euler(endRotation);
        
        while (timeElapsed < duration)
        {
            transform.localRotation = Quaternion.Slerp(startQuaternion, endQuaternion, timeElapsed / duration);
            timeElapsed += Time.deltaTime;
            yield return null;
        }
        
        transform.localRotation = endQuaternion;
    }
    
    // Implements ICard.UpdateVisuals()
    public void UpdateVisuals()
    {
        UpdateCardText();
        ApplyArtwork();
    }
    
    public void MoveToPosition(Vector3 position, Quaternion rotation, Vector3 scale, float speed = 5f)
    {
        targetPosition = position;
        targetRotation = rotation;
        
        // Don't override any existing scale from CardVisuals, just preserve it
        // Only use specified scale for cards without CardVisuals
        if (GetComponent<CardVisuals>() == null)
        {
            targetScale = scale;
        }
        else
        {
            // If we have CardVisuals, just keep current scale
            targetScale = transform.localScale;
        }
        
        moveSpeed = speed;
    }
    
    // Simplified Awake method
    void Awake()
    {
        Debug.Log($"[CARD] Initializing card: {cardName}");
        
        // Ensure this card has a ClickableObject component
        if (GetComponent<ClickableObject>() == null)
        {
            gameObject.AddComponent<ClickableObject>();
        }
    }
    
    // Collider setup removed - now using the collider from the SimpleCard prefab
    
    // Flag to enable/disable automated movement (useful for debugging)
    public bool enableAutoMovement = false; // Disabled by default for easier debugging
    
    // Basic update for card movement
    void Update()
    {
        // Skip auto-movement if disabled (allows for manual positioning during debugging)
        if (!enableAutoMovement)
            return;
            
        // Smoothly move card to target position
        transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * moveSpeed);
        transform.rotation = Quaternion.Lerp(transform.rotation, targetRotation, Time.deltaTime * moveSpeed);
        transform.localScale = Vector3.Lerp(transform.localScale, targetScale, Time.deltaTime * moveSpeed);
    }
    
    // Editor validation removed - now using collider from the SimpleCard prefab
    
    // Apply the artwork to the card visuals
    private void ApplyArtwork()
    {
        if (_artwork == null) return;
        
        // Check if we have the CardVisuals component
        CardVisuals cardVisuals = GetComponent<CardVisuals>();
        if (cardVisuals != null)
        {
            // Let the CardVisuals component handle this
            cardVisuals.RefreshVisuals();
            return;
        }
        
        // Option 1: If using a SpriteRenderer
        SpriteRenderer artworkRenderer = transform.Find("Artwork")?.GetComponent<SpriteRenderer>();
        if (artworkRenderer != null)
        {
            artworkRenderer.sprite = _artwork;
            return;
        }
        
        // If no dedicated component found, but the card itself has a renderer, use that
        SpriteRenderer cardRenderer = GetComponent<SpriteRenderer>();
        if (cardRenderer != null)
        {
            cardRenderer.sprite = _artwork;
        }
        
        // 3D card support with materials is now handled by CardVisuals component
    }
    
    // Update card visual representation with current values
    public void UpdateCardText()
    {
        // UI components have been removed
        // Visual representation is now handled through the CardVisuals component
        
        // If we have a CardVisuals component, refresh it
        CardVisuals cardVisuals = GetComponent<CardVisuals>();
        if (cardVisuals != null)
        {
            cardVisuals.RefreshVisuals();
        }
    }
    
    // Gizmo debugging removed - using SimpleCard prefab with properly configured collider
}