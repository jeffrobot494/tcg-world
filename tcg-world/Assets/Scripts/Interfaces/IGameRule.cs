using Newtonsoft.Json.Linq;
using UnityEngine;

namespace TCGWorld.Interfaces
{
    /// <summary>
    /// Defines the interface for game rule interpretation and enforcement.
    /// </summary>
    public interface IGameRule
    {
        // Rule loading
        bool LoadRules(TextAsset rulesJson);
        
        // Rule information
        JObject GameInfo { get; }
        JArray Zones { get; }
        JObject TurnStructure { get; }
        
        // Rule validation
        bool IsActionAllowedInPhase(string action, string phase);
        bool ValidateCardPlay(ICard card, ICardContainer targetContainer, int playerResources);
        
        // Game mechanics
        int GetStartingResources();
        int GetMaxResources();
        int GetResourcesPerTurn();
    }
}