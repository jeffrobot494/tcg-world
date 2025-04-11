using System.Collections.Generic;
using UnityEngine;

namespace TCGWorld.Interfaces
{
    /// <summary>
    /// Defines the core interface for all card types in the system.
    /// </summary>
    public interface ICard
    {
        // Core properties
        int ID { get; }
        string Name { get; }
        string Description { get; }
        int OwnerID { get; }
        
        // Visual state
        bool IsFaceUp { get; }
        Sprite Artwork { get; set; }
        
        // Basic card operations
        void FlipCard(bool faceUp);
        void UpdateVisuals();
        
        // Zone management
        ICardContainer CurrentContainer { get; set; }
    }
}