using System.Collections;
using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Represents a zone or collection of cards in the Trading Card Game.
/// Examples include: deck, hand, play area, discard pile, etc.
/// </summary>
public class CardZone : MonoBehaviour
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
    public Vector3 defaultRotation = Vector3.zero;
    
    // The actual cards in this zone
    private List<Card> cards = new List<Card>();
    
    // Public access to cards (read-only)
    public IReadOnlyList<Card> Cards => cards.AsReadOnly();
    
    // Card management methods
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
        
        // Update card visuals
        UpdateCardPositions();
        
        // Set card face-up/down based on zone
        card.FlipCard(faceUp);
    }
    
    public Card RemoveCard(int index)
    {
        if (index < 0 || index >= cards.Count)
        {
            Debug.LogError($"Cannot remove card at index {index} from {zoneName}: index out of range.");
            return null;
        }
        
        Card removedCard = cards[index];
        cards.RemoveAt(index);
        
        // Update positions of remaining cards
        UpdateCardPositions();
        
        return removedCard;
    }
    
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
    
    public Card DrawCard()
    {
        if (cards.Count == 0)
        {
            Debug.LogWarning($"Cannot draw card from {zoneName}: zone is empty.");
            return null;
        }
        
        return RemoveCard(0);
    }
    
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
    
    // Update the visual positions of all cards in the zone
    public void UpdateCardPositions()
    {
        for (int i = 0; i < cards.Count; i++)
        {
            Vector3 position = layoutOrigin + (layoutDirection * i * cardSpacing);
            Quaternion rotation = Quaternion.Euler(defaultRotation);
            
            // Move the card to its position in the zone
            cards[i].MoveToPosition(position, rotation, Vector3.one);
        }
    }
}
