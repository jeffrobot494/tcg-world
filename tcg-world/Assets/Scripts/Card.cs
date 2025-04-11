using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro; // Include TextMeshPro namespace if you're using it
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
    public bool isInteractable = false;
    
    // Runtime references
    public CardZone currentZone;
    public int ownerPlayerId;
    
    // ICard interface implementation
    public ICardContainer CurrentContainer 
    { 
        get { return currentZone; } 
        set { currentZone = value as CardZone; } 
    }
    
    // UI Component references (optional, will be found if they exist)
    [Header("UI Components")]
    public Image artworkImage;       // Image component for the card artwork
    public TextMeshProUGUI nameText;      // Text component for card name
    public TextMeshProUGUI costText;      // Text component for cost
    public TextMeshProUGUI attackText;    // Text component for attack value
    public TextMeshProUGUI healthText;    // Text component for health value
    public TextMeshProUGUI descriptionText; // Text component for description
    
    // Visual transform data
    private Vector3 targetPosition;
    private Quaternion targetRotation;
    private Vector3 targetScale;
    private float moveSpeed = 5f;
    
    // Methods for card behavior - implementing ICard interface
    public void FlipCard(bool faceUp)
    {
        isFaceUp = faceUp;
        // Animation and visual update logic would go here
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
        targetScale = scale;
        moveSpeed = speed;
    }
    
    // Basic update for card movement
    void Update()
    {
        // Smoothly move card to target position
        transform.position = Vector3.Lerp(transform.position, targetPosition, Time.deltaTime * moveSpeed);
        transform.rotation = Quaternion.Lerp(transform.rotation, targetRotation, Time.deltaTime * moveSpeed);
        transform.localScale = Vector3.Lerp(transform.localScale, targetScale, Time.deltaTime * moveSpeed);
    }
    
    // Apply the artwork to the card visuals
    private void ApplyArtwork()
    {
        if (_artwork == null) return;
        
        // Find UI components if they haven't been set
        FindUIComponents();
        
        // If we have a direct reference to the artwork image, use that
        if (artworkImage != null)
        {
            artworkImage.sprite = _artwork;
            return;
        }
        
        // Otherwise check for different types of renderers
        
        // Option 1: If using a SpriteRenderer
        SpriteRenderer artworkRenderer = transform.Find("Artwork")?.GetComponent<SpriteRenderer>();
        if (artworkRenderer != null)
        {
            artworkRenderer.sprite = _artwork;
            return;
        }
        
        // Option 2: If using a UI Image (that wasn't found by direct reference)
        Image foundImage = transform.Find("Artwork")?.GetComponent<Image>();
        if (foundImage != null)
        {
            foundImage.sprite = _artwork;
            return;
        }
        
        // If no dedicated component found, but the card itself has a renderer, use that
        SpriteRenderer cardRenderer = GetComponent<SpriteRenderer>();
        if (cardRenderer != null)
        {
            cardRenderer.sprite = _artwork;
        }
        
        // Could also add fallback for 3D cards with materials
    }
    
    /// <summary>
    /// Finds and assigns references to UI components if they're not already set
    /// </summary>
    private void FindUIComponents()
    {
        // Only search if we need to
        bool needsSearch = 
            artworkImage == null ||
            nameText == null ||
            costText == null ||
            attackText == null ||
            healthText == null ||
            descriptionText == null;
            
        if (!needsSearch) return;
        
        // Look for UI components
        if (artworkImage == null)
            artworkImage = transform.Find("Artwork")?.GetComponent<Image>();
            
        if (nameText == null)
            nameText = transform.Find("NameText")?.GetComponent<TextMeshProUGUI>();
            
        if (costText == null)
            costText = transform.Find("CostText")?.GetComponent<TextMeshProUGUI>();
            
        if (attackText == null)
            attackText = transform.Find("AttackText")?.GetComponent<TextMeshProUGUI>();
            
        if (healthText == null)
            healthText = transform.Find("HealthText")?.GetComponent<TextMeshProUGUI>();
            
        if (descriptionText == null)
            descriptionText = transform.Find("DescriptionText")?.GetComponent<TextMeshProUGUI>();
            
    }
    
    // Update text fields with current values
    public void UpdateCardText()
    {
        FindUIComponents();
        
        if (nameText != null)
            nameText.text = cardName;
            
        if (costText != null)
            costText.text = cost.ToString();
            
        if (attackText != null)
            attackText.text = attack.ToString();
            
        if (healthText != null)
            healthText.text = health.ToString();
            
        if (descriptionText != null)
            descriptionText.text = description;
    }
}