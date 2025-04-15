using UnityEngine;
using Newtonsoft.Json;

namespace TCGWorld.Data
{
    /// <summary>
    /// Handles loading and parsing JSON data files
    /// </summary>
    public class DataLoader
    {
        /// <summary>
        /// Loads game rules from a JSON TextAsset
        /// </summary>
        public static GameRules LoadGameRules(TextAsset rulesJson)
        {
            if (rulesJson == null)
            {
                Debug.LogError("DataLoader: Rules JSON file is null!");
                return null;
            }

            try
            {
                // Parse using Newtonsoft.Json
                GameRules rules = JsonConvert.DeserializeObject<GameRules>(rulesJson.text);
                Debug.Log($"DataLoader: Successfully loaded game rules: {rules.GameInfo.Name}");
                return rules;
            }
            catch (System.Exception e)
            {
                Debug.LogError($"DataLoader: Error parsing game rules JSON: {e.Message}");
                return null;
            }
        }
    }
}