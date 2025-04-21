/**
 * TCG World Deckbuilder JavaScript
 * Handles fetching, displaying, and managing cards in the deckbuilder interface
 */

// Configuration and Constants
const API_URL = "https://tcg-world-backend-production.up.railway.app";
const CARDS_PER_PAGE = 50;

// Base URL configuration
const CONFIG = {
  API_URL: "https://tcg-world-backend-production.up.railway.app",
  BASE_HTML_PATH: "html/", // Path to HTML directory
  BASE_CSS_PATH: "css/",   // Path to CSS directory 
  BASE_JS_PATH: "js/"      // Path to JS directory
};

// Application State
const state = {
  gameId: null,
  gameData: null,
  cards: [],
  filteredCards: [],
  currentPage: 1,
  totalPages: 1,
  deck: []
};

// DOM Ready Event
document.addEventListener('DOMContentLoaded', () => {
  initializeDeckbuilder();
});

/**
 * Initialize the deckbuilder application
 */
function initializeDeckbuilder() {
  // Get game ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  state.gameId = urlParams.get('gameId') || 5; // Fallback to 5 if no gameId in URL
  
  // Check for debug mode
  if (urlParams.get('debug') === 'true') {
    document.body.classList.add('debug-mode');
  }
  
  // Fetch game details and name
  fetchGameName();
  
  // Load cards
  loadCards();
  
  // Set up event listeners for pagination
  setupEventListeners();
}

/**
 * Update page elements with game information
 */
function updatePageElements() {
  // Use game name if available, otherwise fallback to game ID
  const gameName = state.gameData?.name || `Game #${state.gameId}`;
  document.getElementById('gameTitle').textContent = `Deck Builder - ${gameName}`;
  
  // Update game link
  const gameLink = document.getElementById('gameLink');
  if (gameLink) {
    gameLink.href = `${CONFIG.BASE_HTML_PATH}game.html?gameId=${state.gameId}`;
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  // Pagination buttons
  const prevPage = document.getElementById('prevPage');
  if (prevPage) {
    prevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderCards();
      }
    });
  }
  
  const nextPage = document.getElementById('nextPage');
  if (nextPage) {
    nextPage.addEventListener('click', () => {
      if (state.currentPage < state.totalPages) {
        state.currentPage++;
        renderCards();
      }
    });
  }

  // Search button
  const searchButton = document.getElementById('searchButton');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      applyFilters();
    });
  }

  // Reset button
  const resetButton = document.getElementById('resetButton');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      resetFilters();
    });
  }
}

/**
 * Load cards from the API
 */
async function loadCards() {
  try {
    // Use POST endpoint which allows for sorting
    const response = await fetch(`${API_URL}/api/games/${state.gameId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sortBy: 'file_name',
        sortOrder: 'ASC',
        limit: 1000 // Get a large number to have all cards available for filtering
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to load cards');
    }
    
    // Parse the response
    state.cards = await response.json();
    
    // Set the filtered cards to all cards initially
    state.filteredCards = [...state.cards];
    
    // Update pagination
    updatePagination();
    
    // Render the first page of cards
    renderCards();

    // Initialize filters based on card data
    initializeFilters();
    
  } catch (error) {
    console.error('Error loading cards:', error);
    document.getElementById('cardGrid').innerHTML = 
      '<div class="no-results">Error loading cards. Please try again later.</div>';
  }
}

/**
 * Initialize filter options based on card data
 */
function initializeFilters() {
  // Find unique card types from data fields
  const typeFilter = document.getElementById('typeFilter');
  if (!typeFilter || !state.cards.length) return;

  // Clear any existing options except the first one
  while (typeFilter.options.length > 1) {
    typeFilter.options.remove(1);
  }

  // Extract unique types from card data
  const types = new Set();
  
  state.cards.forEach(card => {
    if (card.data) {
      // Look for fields that might contain type information
      ['type', 'card_type', 'category'].forEach(field => {
        if (card.data[field]) {
          types.add(card.data[field].toString());
        }
      });
    }
  });

  // Add options to the select element
  Array.from(types).sort().forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });
}

/**
 * Apply search filters to the cards
 */
function applyFilters() {
  const nameSearch = document.getElementById('nameSearch').value.toLowerCase();
  const typeFilter = document.getElementById('typeFilter').value;
  
  state.filteredCards = state.cards.filter(card => {
    let matchesName = true;
    let matchesType = true;
    
    // Check name filter
    if (nameSearch) {
      const cardName = (card.display_name || card.file_name).toLowerCase();
      matchesName = cardName.includes(nameSearch);
    }
    
    // Check type filter
    if (typeFilter && card.data) {
      matchesType = false; // Assume no match unless we find one
      
      // Check common type fields
      ['type', 'card_type', 'category'].forEach(field => {
        if (card.data[field] && card.data[field].toString().toLowerCase() === typeFilter.toLowerCase()) {
          matchesType = true;
        }
      });
    }
    
    return matchesName && matchesType;
  });
  
  // Reset to first page and update display
  state.currentPage = 1;
  updatePagination();
  renderCards();
}

/**
 * Reset all filters
 */
function resetFilters() {
  // Clear filter inputs
  document.getElementById('nameSearch').value = '';
  document.getElementById('typeFilter').value = '';
  
  // Reset to all cards
  state.filteredCards = [...state.cards];
  state.currentPage = 1;
  
  updatePagination();
  renderCards();
}

/**
 * Update pagination information
 */
function updatePagination() {
  state.totalPages = Math.max(1, Math.ceil(state.filteredCards.length / CARDS_PER_PAGE));
  
  // Update page indicator
  const pageIndicator = document.getElementById('pageIndicator');
  if (pageIndicator) {
    pageIndicator.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
  }
  
  // Update card count
  const cardCount = document.getElementById('cardCount');
  if (cardCount) {
    cardCount.textContent = `${state.filteredCards.length} cards found`;
  }
  
  // Update button states
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  
  if (prevPage) {
    prevPage.disabled = state.currentPage <= 1;
  }
  
  if (nextPage) {
    nextPage.disabled = state.currentPage >= state.totalPages;
  }
}

/**
 * Render the current page of cards
 */
function renderCards() {
  const cardGrid = document.getElementById('cardGrid');
  if (!cardGrid) return;
  
  // Clear the grid
  cardGrid.innerHTML = '';
  
  // Check if there are any cards to display
  if (state.filteredCards.length === 0) {
    cardGrid.innerHTML = '<div class="no-results">No cards found matching your criteria.</div>';
    return;
  }
  
  // Calculate the starting and ending indices for the current page
  const startIndex = (state.currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = Math.min(startIndex + CARDS_PER_PAGE, state.filteredCards.length);
  
  // Get the cards for the current page
  const pageCards = state.filteredCards.slice(startIndex, endIndex);
  
  // Render each card
  pageCards.forEach(card => {
    // Create the card element
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.cardId = card.id;
    
    // Add click event to add to deck
    cardElement.addEventListener('click', () => {
      addCardToDeck(card);
    });
    
    // Format card data for display
    let cardDataHtml = '';
    if (card.data && Object.keys(card.data).length > 0) {
      const dataItems = Object.entries(card.data).map(([key, value]) => {
        return `<span class="data-item"><strong>${key}:</strong> ${value}</span>`;
      }).join('');
      
      cardDataHtml = `
        <div class="card-data debug-only">
          ${dataItems}
        </div>
      `;
    }
    
    // Set the card's inner HTML
    cardElement.innerHTML = `
      <img class="card-image" src="${card.image_url}" alt="${card.display_name || card.file_name}">
      <h3 class="card-name debug-only">${card.display_name || card.file_name}</h3>
      ${cardDataHtml}
    `;
    
    // Add the card to the grid
    cardGrid.appendChild(cardElement);
  });
  
  // Update pagination information
  updatePagination();
}

/**
 * Add a card to the deck
 */
function addCardToDeck(card) {
  // Find if card already exists in deck
  const existingCard = state.deck.find(item => item.id === card.id);
  
  if (existingCard) {
    // Increment quantity if already in deck
    existingCard.quantity += 1;
  } else {
    // Add new card to deck
    state.deck.push({
      id: card.id,
      name: card.display_name || card.file_name,
      quantity: 1
    });
  }
  
  // Update the deck display
  renderDeck();
}

/**
 * Render the current deck
 */
function renderDeck() {
  const deckList = document.getElementById('deckList');
  if (!deckList) return;
  
  // Clear the current deck display
  deckList.innerHTML = '';
  
  // Check if deck is empty
  if (state.deck.length === 0) {
    deckList.innerHTML = '<div class="empty-deck">Your deck is empty. Add cards from the library.</div>';
    return;
  }
  
  // Calculate total cards in deck
  const totalCards = state.deck.reduce((sum, card) => sum + card.quantity, 0);
  
  // Update deck count
  const deckCardCount = document.getElementById('deckCardCount');
  if (deckCardCount) {
    deckCardCount.textContent = `${totalCards} cards`;
  }
  
  // Sort the deck by card name
  const sortedDeck = [...state.deck].sort((a, b) => a.name.localeCompare(b.name));
  
  // Render each card in the deck
  sortedDeck.forEach(card => {
    const deckCard = document.createElement('div');
    deckCard.className = 'deck-card';
    deckCard.dataset.cardId = card.id;
    
    deckCard.innerHTML = `
      <div class="deck-card-info">
        <span class="deck-card-quantity">${card.quantity}x</span>
        <span class="deck-card-name">${card.name}</span>
      </div>
      <div class="deck-card-controls">
        <button class="increment-card-btn">+</button>
        <button class="decrement-card-btn">-</button>
        <button class="remove-card-btn">×</button>
      </div>
    `;
    
    // Add event listeners for deck card buttons
    deckCard.querySelector('.increment-card-btn').addEventListener('click', () => {
      card.quantity += 1;
      renderDeck();
    });
    
    deckCard.querySelector('.decrement-card-btn').addEventListener('click', () => {
      if (card.quantity > 1) {
        card.quantity -= 1;
        renderDeck();
      } else {
        // Remove if quantity would be 0
        removeCardFromDeck(card.id);
      }
    });
    
    deckCard.querySelector('.remove-card-btn').addEventListener('click', () => {
      removeCardFromDeck(card.id);
    });
    
    deckList.appendChild(deckCard);
  });
}

/**
 * Remove a card from the deck
 */
function removeCardFromDeck(cardId) {
  state.deck = state.deck.filter(card => card.id !== cardId);
  renderDeck();
}

/**
 * Fetch game details including name
 */
async function fetchGameName() {
  try {
    // Make sure we're using the correct endpoint to get game details
    const response = await fetch(`${API_URL}/api/games/${state.gameId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load game data');
    }
    
    // Parse the response
    const gameData = await response.json();
    state.gameData = gameData;
    
    console.log('Game data fetched:', gameData); // Debug log
    
    // Update page elements with the game name
    updatePageElements();
    
  } catch (error) {
    console.error('Error loading game data:', error);
    // Still update page elements with fallback title if error occurs
    updatePageElements();
  }
}