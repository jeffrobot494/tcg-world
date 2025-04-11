using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.IO;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TCGWorld.Utilities;
using TCGWorld.Interfaces;

/// <summary>
/// Utility class for loading, parsing, and interpreting game rules from JSON.
/// </summary>
public class GameRulesInterpreter : SingletonBehaviour<GameRulesInterpreter>, IGameRule
{
    
    // The loaded game rules
    private JObject gameRules;
    
    // Parsed components for easy access
    public JObject GameInfo { get; private set; }
    public JObject CardProperties { get; private set; }
    public JArray Zones { get; private set; }
    public JObject TurnStructure { get; private set; }
    public JArray WinConditions { get; private set; }
    
    // The OnAwake method from SingletonBehaviour replaces the Awake method
    protected override void OnAwake()
    {
        // No specific initialization needed here
    }
    
    /// <summary>
    /// Load game rules from a JSON text asset
    /// </summary>
    public bool LoadRules(TextAsset rulesJson)
    {
        if (rulesJson == null)
        {
            Debug.LogError("No rules JSON provided!");
            return false;
        }
        
        try
        {
            // Parse the JSON text using Newtonsoft.Json
            gameRules = JObject.Parse(rulesJson.text);
            
            // Extract the components
            ExtractRuleComponents();
            
            Debug.Log($"Successfully loaded game rules: {GameInfo["name"]}");
            return true;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error loading game rules: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Load game rules from a JSON file at the specified path
    /// </summary>
    public bool LoadRulesFromFile(string path)
    {
        try
        {
            string jsonText = File.ReadAllText(path);
            gameRules = JObject.Parse(jsonText);
            
            // Extract the components
            ExtractRuleComponents();
            
            Debug.Log($"Successfully loaded game rules: {GameInfo["name"]}");
            return true;
        }
        catch (System.Exception e)
        {
            Debug.LogError($"Error loading game rules from file: {e.Message}");
            return false;
        }
    }
    
    /// <summary>
    /// Extract the rule components for easier access
    /// </summary>
    private void ExtractRuleComponents()
    {
        // Extract components using Newtonsoft.Json
        GameInfo = (JObject)gameRules["gameInfo"];
        CardProperties = (JObject)gameRules["cardProperties"];
        Zones = (JArray)gameRules["zones"];
        TurnStructure = (JObject)gameRules["turnStructure"];
        WinConditions = (JArray)gameRules["winConditions"];
        
        // Log successful extraction
        Debug.Log("Successfully extracted rule components");
    }
    
    /// <summary>
    /// Get a list of zone names from the rules
    /// </summary>
    public List<string> GetZoneNames()
    {
        List<string> names = new List<string>();
        foreach (JObject zone in Zones)
        {
            names.Add(zone["name"].ToString());
        }
        return names;
    }
    
    /// <summary>
    /// Check if a zone is public (visible to all players)
    /// </summary>
    public bool IsZonePublic(string zoneName)
    {
        foreach (JObject zone in Zones)
        {
            if (zone["name"].ToString() == zoneName)
            {
                return zone["isPublic"].Value<bool>();
            }
        }
        return false;
    }
    
    /// <summary>
    /// Get the maximum number of cards allowed in a zone
    /// </summary>
    public int GetZoneMaxCards(string zoneName)
    {
        foreach (JObject zone in Zones)
        {
            if (zone["name"].ToString() == zoneName)
            {
                return zone["maxCards"].Value<int>();
            }
        }
        return -1; // Default to unlimited
    }
    
    /// <summary>
    /// Check if an action is allowed in the current phase
    /// </summary>
    public bool IsActionAllowedInPhase(string action, string phase)
    {
        JArray phases = (JArray)TurnStructure["phases"];
        
        foreach (JObject p in phases)
        {
            if (p["name"].ToString() == phase)
            {
                JArray allowedActions = (JArray)p["allowedActions"];
                foreach (var allowedAction in allowedActions)
                {
                    if (allowedAction.ToString() == action)
                    {
                        return true;
                    }
                }
                return false;
            }
        }
        
        return false;
    }
    
    /// <summary>
    /// Get the initial resources a player starts with
    /// </summary>
    public int GetStartingResources()
    {
        JObject resourceSystem = (JObject)TurnStructure["resourceSystem"];
        return resourceSystem["startingAmount"].Value<int>();
    }
    
    /// <summary>
    /// Get the maximum resources a player can have
    /// </summary>
    public int GetMaxResources()
    {
        JObject resourceSystem = (JObject)TurnStructure["resourceSystem"];
        return resourceSystem["maxAmount"].Value<int>();
    }
    
    /// <summary>
    /// Get the amount of resources gained each turn
    /// </summary>
    public int GetResourcesPerTurn()
    {
        JObject resourceSystem = (JObject)TurnStructure["resourceSystem"];
        return resourceSystem["gainPerTurn"].Value<int>();
    }
    
    /// <summary>
    /// Check if a player has won based on the current game state
    /// </summary>
    public bool CheckWinCondition(int playerHealth, int opponentHealth, int playerDeckCount, int opponentDeckCount)
    {
        foreach (JObject condition in WinConditions)
        {
            string type = condition["type"].ToString();
            
            switch (type)
            {
                case "healthReduction":
                    int threshold = condition["threshold"].Value<int>();
                    if (opponentHealth <= threshold)
                    {
                        return true;
                    }
                    break;
                    
                case "deckDepletion":
                    if (opponentDeckCount <= 0)
                    {
                        return true;
                    }
                    break;
                    
                // Add other condition types as needed
            }
        }
        
        return false;
    }
    
    /// <summary>
    /// Validate if a card can be played to a specific zone (concrete implementation)
    /// </summary>
    public bool ValidateCardPlay(Card card, CardZone targetZone, int playerResources)
    {
        // Check if player has enough resources
        if (card.cost > playerResources)
        {
            return false;
        }
        
        // Validate card type can be played to this zone
        string zoneName = targetZone.zoneName;
        
        // Only certain card types can be played to the field
        if (zoneName == "Field")
        {
            // Simplified example - in a full implementation, 
            // this would check against rules loaded from JSON
            if (card.cardType != "Creature" && card.cardType != "Structure")
            {
                return false;
            }
        }
        
        // Basic capacity check
        if (targetZone.Cards.Count >= 7 && zoneName == "Field")
        {
            return false;
        }
        
        return true;
    }
    
    /// <summary>
    /// Validate if a card can be played to a specific container
    /// Implements IGameRule.ValidateCardPlay
    /// </summary>
    bool IGameRule.ValidateCardPlay(ICard card, ICardContainer targetContainer, int playerResources)
    {
        // Basic validation: Make sure it's a Card object
        Card concreteCard = card as Card;
        CardZone concreteZone = targetContainer as CardZone;
        
        if (concreteCard == null || concreteZone == null)
        {
            Debug.LogError("Card validation failed: Invalid card or container type");
            return false;
        }
        
        return ValidateCardPlay(concreteCard, concreteZone, playerResources);
    }
}
