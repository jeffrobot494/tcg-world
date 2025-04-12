using UnityEngine;
using TCGWorld.Data;

/// <summary>
/// Test script for loading and parsing game rules JSON
/// </summary>
public class GameRulesLoader : MonoBehaviour
{
    [SerializeField] private TextAsset gameRulesJson;

    void Start()
    {
        if (gameRulesJson == null)
        {
            Debug.LogError("Game rules JSON not assigned in the inspector!");
            return;
        }

        // Test loading the game rules
        GameRules rules = DataLoader.LoadGameRules(gameRulesJson);
        
        if (rules != null)
        {
            // Log the loaded data to verify
            Debug.Log($"Game Name: {rules.GameInfo.Name}");
            Debug.Log($"Game Description: {rules.GameInfo.Description}");
            Debug.Log($"Number of Zones: {rules.Zones.Count}");
            
            // Log details of each zone
            foreach (var zone in rules.Zones)
            {
                Debug.Log($"======= ZONE: {zone.Name} =======");
                Debug.Log($"Properties: MaxCards={zone.MaxCards}, Public={zone.IsPublic}, PerPlayer={zone.PerPlayer}, Ordered={zone.IsOrdered}");
                
                // Log layout properties
                var layout = zone.Layout;
                Debug.Log($"Layout Properties:");
                Debug.Log($"  Position: ({layout.Position.X}, {layout.Position.Y}, {layout.Position.Z})");
                Debug.Log($"  Rotation: ({layout.Rotation.X}, {layout.Rotation.Y}, {layout.Rotation.Z})");
                Debug.Log($"  Size: ({layout.Size.X}, {layout.Size.Y})");
                Debug.Log($"  Card Spacing: {layout.CardSpacing}");
                
                // Show Unity Vector3/Vector2 conversion
                Vector3 unityPosition = layout.Position.ToVector3();
                Vector3 unityRotation = layout.Rotation.ToVector3();
                Vector2 unitySize = layout.Size.ToVector2();
                Debug.Log($"Unity Conversions:");
                Debug.Log($"  Position Vector3: {unityPosition}");
                Debug.Log($"  Rotation Vector3: {unityRotation}");
                Debug.Log($"  Size Vector2: {unitySize}");
            }
        }
    }
}