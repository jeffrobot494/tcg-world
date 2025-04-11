using System.Collections.Generic;
using UnityEngine;

namespace TCGWorld.Interfaces
{
    /// <summary>
    /// Defines the interface for any component that can contain cards.
    /// </summary>
    public interface ICardContainer
    {
        // Properties
        string Name { get; }
        bool IsPublic { get; }
        int OwnerID { get; }
        int Count { get; }
        List<ICard> Cards { get; }
        
        // Core operations
        bool AddCard(ICard card);
        bool RemoveCard(ICard card);
        ICard DrawCard();
        void ShuffleCards();
        
        // Visual management
        void UpdateLayout();
    }
}