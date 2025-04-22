/**
 * TCG World Deckbuilder JavaScript
 * Handles fetching, displaying, and managing cards in the deckbuilder interface
 */

// Configuration Constants
const CARDS_PER_PAGE = 50;

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

// DOM Element Cache
let elements = {};

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
  
  // Cache DOM elements
  cacheDOMElements();
  
  // Fetch game details and name
  fetchGameName();
  
  // Load cards
  loadCards();
  
  // Set up event listeners for UI interactions
  setupEventListeners();
}

/**
 * Cache DOM elements for better performance
 */
function cacheDOMElements() {
  elements = {
    cardGrid: document.getElementById('cardGrid'),
    deckList: document.getElementById('deckList'),
    pageIndicator: document.getElementById('pageIndicator'),
    cardCount: document.getElementById('cardCount'),
    deckCardCount: document.getElementById('deckCardCount'),
    prevPageBtn: document.getElementById('prevPage'),
    nextPageBtn: document.getElementById('nextPage'),
    searchBtn: document.getElementById('searchButton'),
    resetBtn: document.getElementById('resetButton'),
    nameSearch: document.getElementById('nameSearch'),
    typeFilter: document.getElementById('typeFilter'),
    gameTitle: document.getElementById('gameTitle'),
    gameLink: document.getElementById('gameLink')
  };
}

/**
 * Update page elements with game information
 */
function updatePageElements() {
  // Use game name if available, otherwise fallback to game ID
  const gameName = state.gameData?.name || `Game #${state.gameId}`;
  
  if (elements.gameTitle) {
    elements.gameTitle.textContent = `Deck Builder - ${gameName}`;
  }
  
  // Update game link
  if (elements.gameLink) {
    elements.gameLink.href = `${CONFIG.BASE_HTML_PATH}game.html?gameId=${state.gameId}`;
  }
}

/**
 * Set up event listeners for UI interactions
 */
function setupEventListeners() {
  // Card grid event listeners
  if (elements.cardGrid) {
    // Right-click on card to remove from deck
    elements.cardGrid.addEventListener('contextmenu', handleCardRightClick);
  }
  
  // Pagination buttons
  if (elements.prevPageBtn) {
    elements.prevPageBtn.addEventListener('click', () => {
      if (state.currentPage > 1) {
        changePage(state.currentPage - 1);
      }
    });
  }
  
  if (elements.nextPageBtn) {
    elements.nextPageBtn.addEventListener('click', () => {
      if (state.currentPage < state.totalPages) {
        changePage(state.currentPage + 1);
      }
    });
  }

  // Search button
  if (elements.searchBtn) {
    elements.searchBtn.addEventListener('click', () => {
      applyFilters();
    });
  }

  // Reset button
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener('click', () => {
      resetFilters();
    });
  }
}

/**
 * Change the current page
 * @param {number} pageNumber - The page number to change to
 */
function changePage(pageNumber) {
  state.currentPage = pageNumber;
  renderCards();
}

/**
 * Handle right-click on card (to remove from deck)
 * @param {Event} event - The context menu event
 */
function handleCardRightClick(event) {
  event.preventDefault(); // Prevent default context menu
  
  // Find the clicked card element
  const cardElement = event.target.closest('.card');
  if (!cardElement) return;
  
  // Get the card ID
  const cardId = parseInt(cardElement.dataset.cardId);
  
  // Only remove if it's in the deck
  const cardInDeck = findCardInDeck(cardId);
  if (cardInDeck) {
    if (cardInDeck.quantity > 1) {
      // Reduce quantity by 1
      cardInDeck.quantity -= 1;
      renderDeck();
    } else {
      // Remove completely
      removeCardFromDeck(cardId);
    }
    // Re-render to update card highlights
    renderCards();
  }
}

/**
 * Find a card in the deck by ID
 * @param {number} cardId - The card ID to find
 * @returns {Object|null} The card object if found, or null
 */
function findCardInDeck(cardId) {
  return state.deck.find(item => item.id === cardId) || null;
}

/**
 * Check if a card is in the deck
 * @param {number} cardId - The card ID to check
 * @returns {boolean} True if the card is in the deck
 */
function isCardInDeck(cardId) {
  return state.deck.some(item => item.id === cardId);
}

/**
 * Fetch game details including name
 */
async function fetchGameName() {
  try {
    // Make sure we're using the correct endpoint to get game details
    const response = await fetch(`${window.CONFIG.API_URL}/api/games/${state.gameId}`);
    
    if (!response.ok) {
      throw new Error('Failed to load game data');
    }
    
    // Parse the response
    const gameData = await response.json();
    state.gameData = gameData;
    
    // Update page elements with the game name
    updatePageElements();
    
  } catch (error) {
    console.error('Error loading game data:', error);
    // Still update page elements with fallback title if error occurs
    updatePageElements();
  }
}

/**
 * Load cards from the API
 */
async function loadCards() {
  try {
    // Use POST endpoint which allows for sorting
    const response = await fetch(`${window.CONFIG.API_URL}/api/games/${state.gameId}/cards`, {
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
    if (elements.cardGrid) {
      elements.cardGrid.innerHTML = 
        '<div class="no-results">Error loading cards. Please try again later.</div>';
    }
  }
}

/**
 * Initialize filter options based on card data
 */
function initializeFilters() {
  if (!elements.typeFilter || !state.cards.length) return;

  // Clear any existing options except the first one
  while (elements.typeFilter.options.length > 1) {
    elements.typeFilter.options.remove(1);
  }

  // Extract unique types from card data
  const types = extractCardTypes();
  
  // Add options to the select element
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    elements.typeFilter.appendChild(option);
  });
}

/**
 * Extract unique card types from all cards
 * @returns {string[]} Array of unique card types
 */
function extractCardTypes() {
  const types = new Set();
  
  state.cards.forEach(card => {
    // Check for direct type field
    if (card.type) {
      types.add(card.type.toString());
    }
    // Fallback to data object if type not directly on card
    else if (card.data) {
      // Look for fields that might contain type information
      ['type', 'card_type', 'category'].forEach(field => {
        if (card.data[field]) {
          types.add(card.data[field].toString());
        }
      });
    }
  });

  return Array.from(types).sort();
}

/**
 * Apply search filters to the cards
 */
function applyFilters() {
  if (!elements.nameSearch || !elements.typeFilter) return;
  
  const nameSearch = elements.nameSearch.value.toLowerCase();
  const typeFilter = elements.typeFilter.value;
  
  state.filteredCards = filterCards(nameSearch, typeFilter);
  
  // Reset to first page and update display
  state.currentPage = 1;
  updatePagination();
  renderCards();
}

/**
 * Filter cards based on criteria
 * @param {string} nameSearch - Text to search in card names
 * @param {string} typeFilter - Card type to filter by
 * @returns {Object[]} Filtered array of cards
 */
function filterCards(nameSearch, typeFilter) {
  return state.cards.filter(card => {
    let matchesName = true;
    let matchesType = true;
    
    // Check name filter
    if (nameSearch) {
      const cardName = (card.display_name || card.file_name).toLowerCase();
      matchesName = cardName.includes(nameSearch);
    }
    
    // Check type filter
    if (typeFilter) {
      matchesType = false; // Assume no match unless we find one
      
      // Check direct type field first
      if (card.type && card.type.toString().toLowerCase() === typeFilter.toLowerCase()) {
        matchesType = true;
      }
      // Fallback to data object
      else if (card.data) {
        // Check common type fields
        ['type', 'card_type', 'category'].forEach(field => {
          if (card.data[field] && card.data[field].toString().toLowerCase() === typeFilter.toLowerCase()) {
            matchesType = true;
          }
        });
      }
    }
    
    return matchesName && matchesType;
  });
}

/**
 * Reset all filters
 */
function resetFilters() {
  if (!elements.nameSearch || !elements.typeFilter) return;
  
  // Clear filter inputs
  elements.nameSearch.value = '';
  elements.typeFilter.value = '';
  
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
  if (elements.pageIndicator) {
    elements.pageIndicator.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
  }
  
  // Update card count
  if (elements.cardCount) {
    elements.cardCount.textContent = `${state.filteredCards.length} cards found`;
  }
  
  // Update button states
  if (elements.prevPageBtn) {
    elements.prevPageBtn.disabled = state.currentPage <= 1;
  }
  
  if (elements.nextPageBtn) {
    elements.nextPageBtn.disabled = state.currentPage >= state.totalPages;
  }
}

/**
 * Create a card element for display
 * @param {Object} card - Card data
 * @returns {HTMLElement} The card DOM element
 */
function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.dataset.cardId = card.id;
  
  // Add in-deck class if card is in the deck
  if (isCardInDeck(card.id)) {
    cardElement.classList.add('in-deck');
  }
  
  // Add click event to add to deck
  cardElement.addEventListener('click', () => {
    addCardToDeck(card);
  });
  
  // Format card data for display
  let cardDataHtml = formatCardDataHTML(card);
  
  // Set the card's inner HTML
  cardElement.innerHTML = `
    <img class="card-image" src="${card.image_url}" alt="${card.display_name || card.file_name}">
    <h3 class="card-name debug-only">${card.display_name || card.file_name}</h3>
    ${cardDataHtml}
  `;
  
  return cardElement;
}

/**
 * Format card data as HTML
 * @param {Object} card - Card data
 * @returns {string} HTML string of card data
 */
function formatCardDataHTML(card) {
  if (!card.data || Object.keys(card.data).length === 0) return '';
  
  const dataItems = Object.entries(card.data).map(([key, value]) => {
    return `<span class="data-item"><strong>${key}:</strong> ${value}</span>`;
  }).join('');
  
  return `
    <div class="card-data debug-only">
      ${dataItems}
    </div>
  `;
}

/**
 * Render the current page of cards
 */
function renderCards() {
  if (!elements.cardGrid) return;
  
  // Clear the grid
  elements.cardGrid.innerHTML = '';
  
  // Check if there are any cards to display
  if (state.filteredCards.length === 0) {
    elements.cardGrid.innerHTML = '<div class="no-results">No cards found matching your criteria.</div>';
    return;
  }
  
  // Calculate the starting and ending indices for the current page
  const startIndex = (state.currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = Math.min(startIndex + CARDS_PER_PAGE, state.filteredCards.length);
  
  // Get the cards for the current page
  const pageCards = state.filteredCards.slice(startIndex, endIndex);
  
  // Render each card
  pageCards.forEach(card => {
    const cardElement = createCardElement(card);
    elements.cardGrid.appendChild(cardElement);
  });
}

/**
 * Add a card to the deck
 */
function addCardToDeck(card) {
  // Find if card already exists in deck
  const existingCard = findCardInDeck(card.id);
  
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
  
  // Re-render cards to update in-deck highlights
  renderCards();
}

/**
 * Create a deck card element
 * @param {Object} card - Card data from the deck
 * @returns {HTMLElement} Deck card DOM element
 */
function createDeckCardElement(card) {
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
    incrementCardQuantity(card.id);
  });
  
  deckCard.querySelector('.decrement-card-btn').addEventListener('click', () => {
    decrementCardQuantity(card.id);
  });
  
  deckCard.querySelector('.remove-card-btn').addEventListener('click', () => {
    removeCardFromDeck(card.id);
  });
  
  return deckCard;
}

/**
 * Increment card quantity in the deck
 * @param {number} cardId - ID of the card to increment
 */
function incrementCardQuantity(cardId) {
  const card = findCardInDeck(cardId);
  if (card) {
    card.quantity += 1;
    renderDeck();
    renderCards(); // Update card highlights
  }
}

/**
 * Decrement card quantity in the deck
 * @param {number} cardId - ID of the card to decrement
 */
function decrementCardQuantity(cardId) {
  const card = findCardInDeck(cardId);
  if (card) {
    if (card.quantity > 1) {
      card.quantity -= 1;
      renderDeck();
    } else {
      // Remove if quantity would be 0
      removeCardFromDeck(cardId);
    }
    renderCards(); // Update card highlights
  }
}

/**
 * Calculate total cards in the deck
 * @returns {number} Total card count
 */
function calculateTotalCards() {
  return state.deck.reduce((sum, card) => sum + card.quantity, 0);
}

/**
 * Render the current deck
 */
function renderDeck() {
  if (!elements.deckList) return;
  
  // Clear the current deck display
  elements.deckList.innerHTML = '';
  
  // Check if deck is empty
  if (state.deck.length === 0) {
    elements.deckList.innerHTML = '<div class="empty-deck">Your deck is empty. Add cards from the library.</div>';
    return;
  }
  
  // Calculate total cards in deck
  const totalCards = calculateTotalCards();
  
  // Update deck count
  if (elements.deckCardCount) {
    elements.deckCardCount.textContent = `${totalCards} cards`;
  }
  
  // Sort the deck by card name
  const sortedDeck = sortDeckByName();
  
  // Render each card in the deck
  sortedDeck.forEach(card => {
    const deckCard = createDeckCardElement(card);
    elements.deckList.appendChild(deckCard);
  });
}

/**
 * Sort deck cards by name
 * @returns {Object[]} Sorted deck array
 */
function sortDeckByName() {
  return [...state.deck].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Remove a card from the deck
 * @param {number} cardId - ID of the card to remove
 */
function removeCardFromDeck(cardId) {
  state.deck = state.deck.filter(card => card.id !== cardId);
  renderDeck();
  renderCards(); // Re-render to update highlights
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeDeckbuilder);