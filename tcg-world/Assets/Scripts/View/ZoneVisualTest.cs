using UnityEngine;
using TCGWorld.Data;
using TCGWorld.View;

/// <summary>
/// Test script for creating and visualizing zones
/// </summary>
public class ZoneVisualTest : MonoBehaviour
{
    [SerializeField] private TextAsset gameRulesJson;
    
    private GameRules rules;
    private int nextZoneId = 1;
    
    void Start()
    {
        if (gameRulesJson == null)
        {
            Debug.LogError("ZoneVisualTest: Game rules JSON not assigned!");
            return;
        }
        
        // Load game rules
        rules = DataLoader.LoadGameRules(gameRulesJson);
        if (rules == null) return;
        
        // Create zones
        CreateZones();
    }
    
    private void CreateZones()
    {
        Debug.Log($"ZoneVisualTest: Creating zones from rules");
        
        foreach (var zoneDef in rules.Zones)
        {
            // Create zone data (runtime representation)
            ZoneData zoneData = new ZoneData(zoneDef, nextZoneId++, 1); // Player ID 1
            
            // Create zone view entirely at runtime (no prefab)
            GameObject zoneObj = CreateZoneView(zoneData);
            
            Debug.Log($"ZoneVisualTest: Created zone {zoneDef.Name}");
        }
    }
    
    private GameObject CreateZoneView(ZoneData zoneData)
    {
        // Create empty GameObject
        GameObject zoneObject = new GameObject($"Zone_{zoneData.ZoneName}");
        
        // Add ZoneView component
        ZoneView zoneView = zoneObject.AddComponent<ZoneView>();
        
        // Initialize with data
        zoneView.Initialize(zoneData);
        
        return zoneObject;
    }
}