using System.Collections.Generic;
using UnityEngine;
using Newtonsoft.Json;

namespace TCGWorld.Data
{
    /// <summary>
    /// Represents the game rules data loaded from JSON
    /// </summary>
    public class GameRules
    {
        [JsonProperty("gameInfo")]
        public GameInfo GameInfo { get; set; }

        [JsonProperty("zones")]
        public List<ZoneDefinition> Zones { get; set; }
    }

    /// <summary>
    /// Basic game information
    /// </summary>
    public class GameInfo
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }
    }

    /// <summary>
    /// Defines a zone in the game
    /// </summary>
    public class ZoneDefinition
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("perPlayer")]
        public bool PerPlayer { get; set; }

        [JsonProperty("isPublic")]
        public bool IsPublic { get; set; }

        [JsonProperty("isOrdered")]
        public bool IsOrdered { get; set; }

        [JsonProperty("maxCards")]
        public int MaxCards { get; set; }
        
        [JsonProperty("layout")]
        public ZoneLayoutDefinition Layout { get; set; } = new ZoneLayoutDefinition();
    }
    
    /// <summary>
    /// Defines the visual layout of a zone
    /// </summary>
    public class ZoneLayoutDefinition
    {
        [JsonProperty("position")]
        public Vector3Serializable Position { get; set; } = new Vector3Serializable();
        
        [JsonProperty("rotation")]
        public Vector3Serializable Rotation { get; set; } = new Vector3Serializable(90, 0, 0);
        
        [JsonProperty("size")]
        public Vector2Serializable Size { get; set; } = new Vector2Serializable(5, 3);
        
        [JsonProperty("cardSpacing")]
        public float CardSpacing { get; set; } = 1.2f;
    }
    
    /// <summary>
    /// Serializable version of Vector3 for JSON
    /// </summary>
    public class Vector3Serializable
    {
        [JsonProperty("x")]
        public float X { get; set; }
        
        [JsonProperty("y")]
        public float Y { get; set; }
        
        [JsonProperty("z")]
        public float Z { get; set; }
        
        public Vector3Serializable() { }
        
        public Vector3Serializable(float x, float y, float z)
        {
            X = x;
            Y = y;
            Z = z;
        }
        
        public Vector3 ToVector3() => new Vector3(X, Y, Z);
    }
    
    /// <summary>
    /// Serializable version of Vector2 for JSON
    /// </summary>
    public class Vector2Serializable
    {
        [JsonProperty("x")]
        public float X { get; set; }
        
        [JsonProperty("y")]
        public float Y { get; set; }
        
        public Vector2Serializable() { }
        
        public Vector2Serializable(float x, float y)
        {
            X = x;
            Y = y;
        }
        
        public Vector2 ToVector2() => new Vector2(X, Y);
    }
}