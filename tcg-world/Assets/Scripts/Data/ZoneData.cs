using UnityEngine;

namespace TCGWorld.Data
{
    /// <summary>
    /// Represents a runtime instance of a zone in the game
    /// </summary>
    public class ZoneData
    {
        // Reference to the definition (the blueprint)
        public ZoneDefinition Definition { get; private set; }
        
        // Runtime properties
        public int Id { get; private set; }
        public int OwnerId { get; private set; }
        public string ZoneName => Definition.Name; // Convenience property
        
        /// <summary>
        /// Create a new zone instance
        /// </summary>
        public ZoneData(ZoneDefinition definition, int id, int ownerId)
        {
            Definition = definition;
            Id = id;
            OwnerId = ownerId;
            
            Debug.Log($"ZoneData: Created zone {definition.Name} with ID {id} for player {ownerId}");
        }
    }
}