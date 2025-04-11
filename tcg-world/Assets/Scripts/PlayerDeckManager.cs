using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using UnityEngine.UI;

/// <summary>
/// Manages player decks by loading cards from a JSON file and constructing decks.
/// </summary>
public class PlayerDeckManager : MonoBehaviour
{
    [System.Serializable]
    public class CardData
    {
        public int id;
        public string name;
        public string type;
        public int cost;
        public int attack;
        public int health;
        public string description;
        public List<string> tags = new List<string>();
        public string artworkUrl; // URL for remote image
    }

    [System.Serializable]
    public class CardCollection
    {
        public List<CardData> cards = new List<CardData>();
    }

    // Singleton pattern
    public static PlayerDeckManager Instance { get; private set; }

    // Path to the card data file relative to Assets folder
    public TextAsset cardsJsonFile;

    // The loaded card collection
    private CardCollection cardCollection;

    private void Awake()
    {
        // Singleton setup
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
        }
        else
        {
            Instance = this;
        }

        // Load cards from JSON file
        LoadCards();
    }

    // Load cards from the JSON file
    // Make this method public so it can be called after assigning cardsJsonFile at runtime if needed
    public void LoadCards()
    {
        // First check if a direct file reference was assigned in the inspector
        if (cardsJsonFile != null)
        {
            try {
                // Parse the JSON using Newtonsoft.Json
                JObject jsonData = JObject.Parse(cardsJsonFile.text);
                JArray cardsArray = (JArray)jsonData["cards"];
                
                // Convert to our CardData objects
                cardCollection = new CardCollection();
                cardCollection.cards = new List<CardData>();
                
                foreach (JObject cardJson in cardsArray)
                {
                    CardData card = new CardData()
                    {
                        id = cardJson["id"].Value<int>(),
                        name = cardJson["name"].Value<string>(),
                        type = cardJson["type"].Value<string>(),
                        cost = cardJson["cost"].Value<int>(),
                        attack = cardJson["attack"].Value<int>(),
                        health = cardJson["health"].Value<int>(),
                        description = cardJson["description"].Value<string>(),
                        tags = new List<string>(),
                        // Default artwork URL if none is provided
                        artworkUrl = "https://github.com/jeffrobot494/tcg-v3/blob/master/generated_cards/Descendants/Blitzjager.png?raw=true"
                    };
                    
                    // If artworkUrl is present in the JSON, use that instead
                    if (cardJson["artworkUrl"] != null)
                    {
                        card.artworkUrl = cardJson["artworkUrl"].Value<string>();
                    }
                    
                    // Add tags if present
                    if (cardJson["tags"] != null)
                    {
                        JArray tagsArray = (JArray)cardJson["tags"];
                        foreach (JToken tag in tagsArray)
                        {
                            card.tags.Add(tag.ToString());
                        }
                    }
                    
                    cardCollection.cards.Add(card);
                }
                
                Debug.Log($"Loaded {cardCollection.cards.Count} cards from JSON file reference.");
                return;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Error parsing card JSON: {e.Message}");
            }
        }
        
        // If no direct reference, try loading from Resources folder
        TextAsset cardListAsset = Resources.Load<TextAsset>("ExampleCards");
        if (cardListAsset != null)
        {
            try {
                // Parse the JSON using Newtonsoft.Json
                JObject jsonData = JObject.Parse(cardListAsset.text);
                JArray cardsArray = (JArray)jsonData["cards"];
                
                // Convert to our CardData objects
                cardCollection = new CardCollection();
                cardCollection.cards = new List<CardData>();
                
                foreach (JObject cardJson in cardsArray)
                {
                    CardData card = new CardData()
                    {
                        id = cardJson["id"].Value<int>(),
                        name = cardJson["name"].Value<string>(),
                        type = cardJson["type"].Value<string>(),
                        cost = cardJson["cost"].Value<int>(),
                        attack = cardJson["attack"].Value<int>(),
                        health = cardJson["health"].Value<int>(),
                        description = cardJson["description"].Value<string>(),
                        tags = new List<string>(),
                        // Default artwork URL if none is provided
                        artworkUrl = "https://github.com/jeffrobot494/tcg-v3/blob/master/generated_cards/Descendants/Blitzjager.png?raw=true"
                    };
                    
                    // If artworkUrl is present in the JSON, use that instead
                    if (cardJson["artworkUrl"] != null)
                    {
                        card.artworkUrl = cardJson["artworkUrl"].Value<string>();
                    }
                    
                    // Add tags if present
                    if (cardJson["tags"] != null)
                    {
                        JArray tagsArray = (JArray)cardJson["tags"];
                        foreach (JToken tag in tagsArray)
                        {
                            card.tags.Add(tag.ToString());
                        }
                    }
                    
                    cardCollection.cards.Add(card);
                }
                
                Debug.Log($"Loaded {cardCollection.cards.Count} cards from Resources folder.");
                return;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Error parsing card JSON from Resources: {e.Message}");
            }
        }
        
        // If no files found, create an empty collection
        Debug.LogError("Card JSON file not found in inspector or Resources folder!");
        cardCollection = new CardCollection { cards = new List<CardData>() };
    }

    // Create a deck of cards for a player with random selection
    public List<CardData> CreateRandomDeck(int playerId, int deckSize = 30)
    {
        if (cardCollection == null || cardCollection.cards.Count == 0)
        {
            Debug.LogError("No cards loaded! Cannot create deck.");
            return new List<CardData>();
        }

        List<CardData> deck = new List<CardData>();
        List<CardData> availableCards = new List<CardData>(cardCollection.cards);
        
        // Duplicate cards to have a larger pool if needed
        List<CardData> duplicatePool = new List<CardData>();
        foreach (var card in availableCards)
        {
            // Add 3 copies of each card to the duplicate pool
            for (int i = 0; i < 3; i++)
            {
                duplicatePool.Add(card);
            }
        }

        // Create the random deck
        for (int i = 0; i < deckSize; i++)
        {
            if (duplicatePool.Count == 0)
            {
                Debug.LogWarning("Ran out of cards to add to deck!");
                break;
            }

            int randomIndex = Random.Range(0, duplicatePool.Count);
            CardData selectedCard = duplicatePool[randomIndex];
            
            // Create a copy to avoid reference issues
            CardData cardCopy = new CardData
            {
                id = selectedCard.id,
                name = selectedCard.name,
                type = selectedCard.type,
                cost = selectedCard.cost,
                attack = selectedCard.attack,
                health = selectedCard.health,
                description = selectedCard.description,
                tags = new List<string>(selectedCard.tags),
                artworkUrl = selectedCard.artworkUrl
            };
            
            // Add player ID to ensure card ownership is clear
            cardCopy.id = (playerId * 1000) + cardCopy.id;
            
            deck.Add(cardCopy);
            
            // Remove the selected card from the pool to avoid excessive duplicates
            duplicatePool.RemoveAt(randomIndex);
        }

        Debug.Log($"Created random deck with {deck.Count} cards for player {playerId}");
        return deck;
    }

    // Create a Card component from CardData
    public Card CreateCardFromData(CardData cardData, GameObject cardPrefab)
    {
        GameObject cardObj = Instantiate(cardPrefab);
        cardObj.name = $"Card_{cardData.id}_{cardData.name}";
        
        Card cardComponent = cardObj.GetComponent<Card>();
        if (cardComponent == null)
        {
            cardComponent = cardObj.AddComponent<Card>();
        }
        
        // Configure the card
        cardComponent.id = cardData.id;
        cardComponent.cardName = cardData.name;
        cardComponent.description = cardData.description;
        cardComponent.cost = cardData.cost;
        cardComponent.attack = cardData.attack;
        cardComponent.health = cardData.health;
        cardComponent.cardType = cardData.type;
        cardComponent.ownerPlayerId = cardData.id / 1000; // Extract player ID from card ID
        
        if (cardData.tags != null)
        {
            cardComponent.tags = new List<string>(cardData.tags);
        }
        
        // Update the card's text fields
        cardComponent.UpdateCardText();
        
        // Load artwork from URL
        if (!string.IsNullOrEmpty(cardData.artworkUrl))
        {
            // Find or create a CardImageLoader
            CardImageLoader imageLoader = FindObjectOfType<CardImageLoader>();
            if (imageLoader == null)
            {
                GameObject loaderObj = new GameObject("Card Image Loader");
                imageLoader = loaderObj.AddComponent<CardImageLoader>();
            }
            
            // Request the artwork
            imageLoader.LoadCardArt(cardData.artworkUrl, (sprite) => {
                // When download completes, set the sprite
                if (cardComponent != null) // Check if card still exists
                {
                    cardComponent.artwork = sprite;
                }
            });
        }
        
        return cardComponent;
    }

    // Populate a zone with a deck of cards
    public void PopulateZoneWithDeck(List<CardData> deck, CardZone zone, GameObject cardPrefab)
    {
        foreach (var cardData in deck)
        {
            Card card = CreateCardFromData(cardData, cardPrefab);
            zone.AddCard(card);
        }
        
        Debug.Log($"Populated zone {zone.zoneName} with {deck.Count} cards");
    }
}