using System.Collections;
using System.Collections.Generic;
using UnityEngine;
// UI imports removed
using TCGWorld.Utilities;

/// <summary>
/// Simplified input manager that only logs card clicks
/// </summary>
public class InputManager : SingletonBehaviour<InputManager>
{
    // Reference to currently selected card (if any)
    private Card selectedCard = null;
    
    protected override void OnAwake()
    {        
        Debug.Log("[INIT] InputManager initializing");
        ConnectToClickableObjects();
        Debug.Log("[INIT] InputManager initialization complete");
    }
    
    // Card collider verification removed - now using SimpleCard prefab with properly configured collider
    
    private void ConnectToClickableObjects()
    {
        // Find and connect to all clickable objects
        ClickableObject[] clickables = FindObjectsOfType<ClickableObject>();
        Debug.Log($"[CONNECT] Found {clickables.Length} ClickableObject components in the scene");
        
        foreach (ClickableObject clickable in clickables)
        {
            // Clear existing listeners and add our handler
            clickable.OnClickEvent.RemoveAllListeners();
            clickable.OnClickEvent.AddListener(() => HandleObjectClicked(clickable.gameObject));
        }
        
        // Add ClickableObject to cards that don't have it
        Card[] allCards = FindObjectsOfType<Card>();
        foreach (Card card in allCards)
        {
            if (card.GetComponent<ClickableObject>() == null)
            {
                card.gameObject.AddComponent<ClickableObject>();
            }
        }
    }
    
    // Public method that ClickableObject can call directly
    public void HandleObjectClicked(GameObject clickedObject)
    {
        Debug.Log($"Object clicked: {clickedObject.name} at position {clickedObject.transform.position}");
        
        // Try to get card component directly from clicked object
        Card clickedCard = clickedObject.GetComponent<Card>();
        
        // If not found, try parent (in case a child collider was clicked)
        if (clickedCard == null)
        {
            clickedCard = clickedObject.GetComponentInParent<Card>();
            if (clickedCard != null)
            {
                Debug.Log($"Found card in parent: {clickedCard.cardName}");
            }
        }
            
        if (clickedCard != null)
        {
            Debug.Log($"CARD CLICKED: {clickedCard.cardName} in zone {clickedCard.currentZone?.zoneName ?? "none"}");
            
            // For future implementation, we'll select the card here
            if (selectedCard != clickedCard)
            {
                // Deselect previous card if there was one
                if (selectedCard != null)
                {
                    Debug.Log($"Deselected previous card: {selectedCard.cardName}");
                }
                
                // Select new card
                selectedCard = clickedCard;
                Debug.Log($"Selected new card: {selectedCard.cardName}");
            }
            else
            {
                // Clicked the same card again
                Debug.Log($"Clicked already selected card: {selectedCard.cardName}");
            }
        }
        else
        {
            Debug.Log("Clicked object is not a card");
        }
    }
    
    // Method to deselect the currently selected card
    public void DeselectCard()
    {
        if (selectedCard != null)
        {
            Debug.Log($"Deselected card: {selectedCard.cardName}");
            selectedCard = null;
        }
    }
}