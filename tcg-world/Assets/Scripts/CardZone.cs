using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TCGWorld.Interfaces;
using System.Linq;

/// <summary>
/// Represents a zone or collection of cards in the Trading Card Game.
/// Examples include: deck, hand, play area, discard pile, etc.
/// </summary>
public class CardZone : MonoBehaviour, ICardContainer
{
    // Zone identification
    public string zoneName;
    public int ownerPlayerId;
    
    // Zone properties
    public bool isPublic = false;  // Visible to all players
    public bool isOrderable = true;  // Can cards be manually ordered
    public bool isInteractable = true;  // Can player interact with cards here
    public int maxCapacity = -1;  // -1 means unlimited
    
    // Layout properties
    public Vector3 layoutOrigin;
    public Vector3 layoutDirection = Vector3.right;
    public float cardSpacing = 0.5f;
    public bool faceUp = false;
    public Vector3 defaultRotation = new Vector3(90, 0, 0); // Changed from Vector3.zero to lay flat on X,Z plane
    
    // Reference to collider
    private BoxCollider zoneCollider;
    
    // The actual cards in this zone
    private List<Card> cards = new List<Card>();
    
    // Original property for backward compatibility
    public IReadOnlyList<Card> Cards => cards.AsReadOnly();
    
    // ICardContainer implementation
    string ICardContainer.Name => zoneName;
    bool ICardContainer.IsPublic => isPublic;
    int ICardContainer.OwnerID => ownerPlayerId;
    int ICardContainer.Count => cards.Count;
    List<ICard> ICardContainer.Cards => cards.Cast<ICard>().ToList();
    
    void Awake()
    {
        Debug.Log($"[ZONE] Initializing zone: {zoneName}");
    }
    
    // Original method for backward compatibility (keep this)
    public void AddCard(Card card, int position = -1)
    {
        // Check if zone is at capacity
        if (maxCapacity > 0 && cards.Count >= maxCapacity)
        {
            Debug.LogWarning($"Cannot add card to {zoneName}: zone is at capacity.");
            return;
        }
        
        // Add card to the zone
        if (position < 0 || position >= cards.Count)
        {
            cards.Add(card);
        }
        else
        {
            cards.Insert(position, card);
        }
        
        // Update card's current zone
        card.currentZone = this;
        
        // Make the card a child of this zone in the hierarchy
        card.transform.SetParent(this.transform, true);
        
        // Update card visuals
        UpdateCardPositions();
        
        // Set card face-up/down based on zone
        card.FlipCard(faceUp);
    }
    
    // ICardContainer implementation
    bool ICardContainer.AddCard(ICard card)
    {
        Card concreteCard = card as Card;
        if (concreteCard == null)
        {
            Debug.LogError($"Cannot add card to {zoneName}: card is not of type Card.");
            return false;
        }
        
        AddCard(concreteCard);
        return true;
    }
    
    // Original method for backward compatibility
    public Card RemoveCard(int index)
    {
        if (index < 0 || index >= cards.Count)
        {
            Debug.LogError($"Cannot remove card at index {index} from {zoneName}: index out of range.");
            return null;
        }
        
        Card removedCard = cards[index];
        cards.RemoveAt(index);
        
        // Unparent the card from this zone
        removedCard.transform.SetParent(null);
        
        // Update positions of remaining cards
        UpdateCardPositions();
        
        return removedCard;
    }
    
    // Original method for backward compatibility
    public Card RemoveCard(Card card)
    {
        int index = cards.IndexOf(card);
        if (index == -1)
        {
            Debug.LogError($"Cannot remove card {card.cardName} from {zoneName}: card not found.");
            return null;
        }
        
        return RemoveCard(index);
    }
    
    // Original method for backward compatibility
    public Card DrawCard()
    {
        if (cards.Count == 0)
        {
            Debug.LogWarning($"Cannot draw card from {zoneName}: zone is empty.");
            return null;
        }
        
        return RemoveCard(0);
    }
    
    // Original method for backward compatibility
    public void ShuffleCards()
    {
        if (!isOrderable)
        {
            Debug.LogWarning($"Cannot shuffle {zoneName}: zone is not orderable.");
            return;
        }
        
        // Fisher-Yates shuffle
        for (int i = cards.Count - 1; i > 0; i--)
        {
            int j = Random.Range(0, i + 1);
            Card temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }
        
        UpdateCardPositions();
    }
    
    // Original method for backward compatibility
    public void UpdateCardPositions()
    {
        for (int i = 0; i < cards.Count; i++)
        {
            // Position calculation now considers X,Z plane
            // For a horizontal layout on X,Z plane, we use:
            Vector3 position = layoutOrigin + (new Vector3(layoutDirection.x, 0, layoutDirection.z) * i * cardSpacing);
            Quaternion rotation = Quaternion.Euler(defaultRotation);
            
            // Use Vector3.one since we'll handle actual card size in the CardVisuals component
            // This prevents any unwanted stretching from this scale factor
            Vector3 cardScale = Vector3.one;
            
            // Move the card to its position in the zone
            cards[i].MoveToPosition(position, rotation, cardScale);
        }
    }
    
    // Interface implementations
    bool ICardContainer.RemoveCard(ICard card)
    {
        Card concreteCard = card as Card;
        if (concreteCard == null) return false;
        
        Card result = RemoveCard(concreteCard);
        return result != null;
    }
    
    ICard ICardContainer.DrawCard()
    {
        return DrawCard();
    }
    
    void ICardContainer.ShuffleCards()
    {
        ShuffleCards();
    }
    
    void ICardContainer.UpdateLayout()
    {
        UpdateCardPositions();
    }
}
