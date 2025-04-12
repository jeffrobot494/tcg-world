using UnityEngine;
using UnityEngine.Events;

/// <summary>
/// Simplified clickable object component that only triggers click events
/// </summary>
public class ClickableObject : MonoBehaviour
{
    // Event that gets triggered when this object is clicked
    public UnityEvent OnClickEvent = new UnityEvent();
    
    void Awake()
    {
        // Ensure this object has a collider
        Collider attachedCollider = GetComponent<Collider>();
        
        // If this is attached to a Card, the card should already have a collider from the prefab
        Card card = GetComponent<Card>();
        if (card != null)
        {
            // Cards should have colliders configured in the prefab
            if (attachedCollider == null)
            {
                Debug.LogWarning($"[CLICKABLE] Card {card.cardName} missing collider from prefab");
            }
            return;
        }
        
        // For non-card objects, add a collider if needed
        if (attachedCollider == null)
        {
            // Add a box collider if none exists
            BoxCollider boxCollider = gameObject.AddComponent<BoxCollider>();
            
            // Check if it's a card zone
            CardZone zone = GetComponent<CardZone>();
            if (zone != null)
            {
                // For card zones, make a flat collider to match the zone
                boxCollider.size = new Vector3(5.0f, 0.1f, 5.0f);
                boxCollider.center = new Vector3(0f, 0.05f, 0f);
                Debug.Log($"[CLICKABLE] Added zone collider to {gameObject.name}");
            }
            else
            {
                // For other objects, use a general size
                boxCollider.size = new Vector3(1.0f, 0.1f, 1.0f);
                boxCollider.center = new Vector3(0f, 0.05f, 0f);
                Debug.Log($"[CLICKABLE] Added general collider to {gameObject.name}");
            }
            
            boxCollider.isTrigger = true;
        }
    }
    
    void Start()
    {
        // Connect to InputManager if it exists
        InputManager inputManager = InputManager.Instance;
        if (inputManager != null)
        {
            // Add listener to send click events to InputManager
            OnClickEvent.RemoveAllListeners();
            OnClickEvent.AddListener(() => inputManager.HandleObjectClicked(gameObject));
        }
    }
    
    /// <summary>
    /// Called by Unity when mouse button is pressed while over this object
    /// </summary>
    void OnMouseDown()
    {
        // Simply invoke the click event
        OnClickEvent.Invoke();
    }
}