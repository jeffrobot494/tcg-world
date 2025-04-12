using UnityEngine;

/// <summary>
/// Utility class for fixing card visual issues.
/// Attach to any GameObject in the scene.
/// </summary>
public class CardVisualFixer : MonoBehaviour
{
    [Tooltip("If true, will update all cards in the scene on start")]
    public bool fixAllCardsOnStart = true;
    
    void Start()
    {
        if (fixAllCardsOnStart)
        {
            FixAllCardVisuals();
        }
    }
    
    /// <summary>
    /// Find all cards in the scene and fix their visuals
    /// </summary>
    public void FixAllCardVisuals()
    {
        Card[] allCards = FindObjectsOfType<Card>();
        
        Debug.Log($"Found {allCards.Length} cards to fix visuals for");
        
        foreach (Card card in allCards)
        {
            FixCardVisual(card);
        }
    }
    
    /// <summary>
    /// Fix visual issues with a specific card
    /// </summary>
    public void FixCardVisual(Card card)
    {
        // Reset scale to avoid stretching
        card.transform.localScale = Vector3.one;
        
        // Ensure the card has proper visuals
        CardVisuals visuals = card.GetComponent<CardVisuals>();
        if (visuals == null)
        {
            visuals = card.gameObject.AddComponent<CardVisuals>();
            Debug.Log($"Added CardVisuals to {card.name}");
        }
        
        // Force refresh the visuals
        visuals.RefreshVisuals();
    }
}
