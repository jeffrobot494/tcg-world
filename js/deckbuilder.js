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
    gameLink: document.getElementById('gameLink'),
    exportDeckBtn: document.getElementById('exportDeckBtn'),
    clearDeckBtn: document.getElementById('clearDeckBtn'),
    saveDeckBtn: document.getElementById('saveDeckBtn'),
    importDeckBtn: document.getElementById('importDeckBtn')
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
    elements.gameLink.href = `${window.CONFIG.BASE_HTML_PATH}game.html?gameId=${state.gameId}`;
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
  
  // Deck control buttons
  if (elements.exportDeckBtn) {
    elements.exportDeckBtn.addEventListener('click', exportDeckAsImage);
  }
  
  if (elements.clearDeckBtn) {
    elements.clearDeckBtn.addEventListener('click', clearDeck);
  }
  
  if (elements.saveDeckBtn) {
    elements.saveDeckBtn.addEventListener('click', saveDeck);
  }
  
  if (elements.importDeckBtn) {
    elements.importDeckBtn.addEventListener('click', importDeck);
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
 * Upload an image directly to Cloudinary
 * @param {Blob} blob - The image blob to upload
 * @param {string} fileName - Name for the file
 * @returns {Promise<string>} URL of the uploaded image
 */
async function uploadToCloudinary(blob, fileName) {
  // Create form data for direct Cloudinary upload
  const cloudinaryFormData = new FormData();
  cloudinaryFormData.append('file', blob, fileName);
  cloudinaryFormData.append('upload_preset', 'TCG-World Unsigned');
  
  try {
    // Upload directly to Cloudinary
    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dmfjx6e7z/image/upload', {
      method: 'POST',
      body: cloudinaryFormData
    });
    
    if (!cloudinaryResponse.ok) {
      throw new Error(`Failed to upload to Cloudinary: ${cloudinaryResponse.statusText}`);
    }
    
    // Parse the Cloudinary response
    const cloudinaryData = await cloudinaryResponse.json();
    
    // Return the secure URL from Cloudinary
    return cloudinaryData.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Display a dialog with the image URL and copy button
 * @param {string} imageUrl - URL of the uploaded image
 */
function showImageUrlDialog(imageUrl) {
  // Create dialog element
  const dialog = document.createElement('div');
  dialog.className = 'image-url-dialog';
  
  // Create content
  dialog.innerHTML = `
    <div class="dialog-header">
      <h3>Deck Image URL</h3>
      <button class="close-btn">×</button>
    </div>
    <div class="dialog-body">
      <p>Your deck image has been uploaded. Copy this URL to use in Tabletop Simulator:</p>
      <div class="url-container">
        <input type="text" readonly value="${imageUrl}" class="url-input">
        <button class="copy-btn">Copy</button>
      </div>
      <div class="preview">
        <img src="${imageUrl}" alt="Deck Preview" class="preview-image">
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .image-url-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      width: 500px;
      max-width: 90vw;
      z-index: 1000;
    }
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    .dialog-header h3 {
      margin: 0;
      font-weight: bold;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    .dialog-body {
      padding: 16px;
    }
    .url-container {
      display: flex;
      margin: 12px 0;
    }
    .url-input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px 0 0 4px;
      font-family: monospace;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .copy-btn {
      padding: 8px 16px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 0 4px 4px 0;
      cursor: pointer;
    }
    .preview {
      margin-top: 16px;
      text-align: center;
      max-height: 300px;
      overflow-y: auto;
    }
    .preview-image {
      max-width: 100%;
      border: 1px solid #eee;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }
  `;
  
  // Create backdrop overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  
  // Add to DOM
  document.body.appendChild(style);
  document.body.appendChild(overlay);
  document.body.appendChild(dialog);
  
  // Close dialog handler
  const closeDialog = () => {
    document.body.removeChild(style);
    document.body.removeChild(overlay);
    document.body.removeChild(dialog);
  };
  
  // Add event listeners
  dialog.querySelector('.close-btn').addEventListener('click', closeDialog);
  overlay.addEventListener('click', closeDialog);
  
  // Copy URL functionality
  const copyBtn = dialog.querySelector('.copy-btn');
  const urlInput = dialog.querySelector('.url-input');
  
  copyBtn.addEventListener('click', async () => {
    try {
      // Try to use the modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(imageUrl);
      } else {
        // Fall back to the older method
        urlInput.select();
        document.execCommand('copy');
      }
      
      // Show success feedback
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL. Please select and copy it manually.');
    }
  });
}

/**
 * Clear the deck
 */
function clearDeck() {
  if (state.deck.length === 0) return;
  
  if (confirm('Are you sure you want to clear your deck?')) {
    state.deck = [];
    renderDeck();
    renderCards(); // Re-render to update card highlights
  }
}

/**
 * Export deck as an image
 */
async function exportDeckAsImage() {
  if (state.deck.length === 0) {
    alert('Your deck is empty. Add cards to create an exportable image.');
    return;
  }
  
  // Show loading state
  const exportBtn = elements.exportDeckBtn;
  const originalText = exportBtn.textContent;
  exportBtn.disabled = true;
  exportBtn.textContent = 'Exporting...';
  
  try {
    // Get all card data needed for the export
    const cardDetails = await fetchCardsForExport();
    
    // Create and download the image
    generateDeckImage(cardDetails);
  } catch (error) {
    console.error('Error exporting deck:', error);
    alert('Failed to export deck image. Please try again.');
  } finally {
    // Reset button state
    exportBtn.disabled = false;
    exportBtn.textContent = originalText;
  }
}

/**
 * Fetch full card details for export
 * @returns {Promise<Array>} Card details for the deck
 */
async function fetchCardsForExport() {
  // Create a map of card IDs to quantities for easy lookup
  const cardQuantities = {};
  state.deck.forEach(card => {
    cardQuantities[card.id] = card.quantity;
  });
  
  // Use cards from state if they're already loaded
  const cardDetails = state.cards
    .filter(card => cardQuantities[card.id])
    .map(card => ({
      ...card,
      quantity: cardQuantities[card.id]
    }));
    
  return cardDetails;
}

/**
 * Generate and download a deck image
 * @param {Array} cardDetails - Full card data for the deck
 */
function generateDeckImage(cardDetails) {
  if (cardDetails.length === 0) {
    alert('No cards to export.');
    return;
  }
  
  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Fixed grid dimensions as specified
  const gridWidth = 10;  // Always 10 cards wide
  const gridHeight = 7;  // Always 7 cards high
  
  // First, we need to determine card dimensions by loading the first card image
  const firstCard = new Image();
  firstCard.crossOrigin = 'Anonymous';
  firstCard.onload = () => {
    // Calculate the aspect ratio of the first card
    const cardAspectRatio = firstCard.width / firstCard.height;
    
    // Determine card dimensions for the grid
    const cardHeight = 140; // Base height
    const cardWidth = Math.floor(cardHeight * cardAspectRatio);
    
    // Set canvas dimensions for the fixed 10x7 grid exactly
    // No margins, no headers, just the grid
    canvas.width = gridWidth * cardWidth;
    canvas.height = gridHeight * cardHeight;
    
    // Load and draw all card images
    let currentRow = 0;
    let currentCol = 0;
    
    // Create a function to place each card copy on the grid
    const placeCardOnGrid = (img, cardIndex) => {
      // Calculate position in the 10x7 grid
      const row = Math.floor(cardIndex / gridWidth);
      const col = cardIndex % gridWidth;
      
      // Calculate pixel position - no margins
      const x = col * cardWidth;
      const y = row * cardHeight;
      
      // Draw card
      ctx.drawImage(img, x, y, cardWidth, cardHeight);
    };
    
    // Function to process each card
    const processCard = (card, quantity) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          // Place each copy of the card in the grid
          for (let i = 0; i < quantity; i++) {
            const cardIndex = currentRow * gridWidth + currentCol;
            
            // Only place the card if it fits in our 10x7 grid
            if (cardIndex < gridWidth * gridHeight) {
              placeCardOnGrid(img, cardIndex);
              
              // Move to next position
              currentCol++;
              if (currentCol >= gridWidth) {
                currentCol = 0;
                currentRow++;
              }
            }
          }
          resolve();
        };
        
        img.onerror = () => {
          console.error(`Failed to load image: ${card.image_url}`);
          resolve();
        };
        
        img.src = card.image_url;
      });
    };
    
    // Process all cards and create the download link
    let flattenedCards = [];
    
    // Create a flattened array of card/quantity pairs
    cardDetails.forEach(card => {
      for (let i = 0; i < card.quantity; i++) {
        flattenedCards.push(card);
      }
    });
    
    // Limit to grid capacity (10x7 = 70 cards)
    flattenedCards = flattenedCards.slice(0, gridWidth * gridHeight);
    
    // Process each card sequentially to maintain order
    const processSequentially = async () => {
      for (const card of flattenedCards) {
        await processCard(card, 1);
      }
      
      // Get game name for filename only
      const gameName = state.gameData?.name || `Game${state.gameId}`;
      const fileName = `${gameName.replace(/\s+/g, '_')}_deck.png`;
      
      // Convert canvas to blob then upload to Cloudinary
      canvas.toBlob(async blob => {
        try {
          // Show uploading status
          const exportBtn = elements.exportDeckBtn;
          exportBtn.disabled = true;
          exportBtn.textContent = 'Uploading...';
          
          try {
            // Try to upload to Cloudinary via our backend API
            const imageUrl = await uploadToCloudinary(blob, fileName);
            
            // Show URL in a dialog
            showImageUrlDialog(imageUrl);
          } catch (uploadError) {
            console.error('Cloudinary upload failed, falling back to local download:', uploadError);
            
            // Fall back to local download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.click();
            
            // Clean up the object URL
            setTimeout(() => URL.revokeObjectURL(url), 60000);
            
            // Show fallback message
            alert('Online upload failed. The image has been downloaded to your device instead.');
          }
        } catch (error) {
          console.error('Error uploading deck image:', error);
          alert('Failed to upload deck image. Please try again.');
        } finally {
          // Reset button
          const exportBtn = elements.exportDeckBtn;
          exportBtn.disabled = false;
          exportBtn.textContent = 'Export';
        }
      });
    };
    
    processSequentially().catch(error => {
      console.error('Error generating deck image:', error);
      alert('Failed to generate deck image. Please try again.');
    });
  };
  
  firstCard.onerror = () => {
    console.error('Failed to load first card image to determine dimensions');
    alert('Failed to determine card dimensions. Please try again.');
  };
  
  // Load the first card to determine dimensions
  firstCard.src = cardDetails[0].image_url;
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

/**
 * Save the current deck to local storage
 */
function saveDeck() {
  if (state.deck.length === 0) {
    alert('Your deck is empty. Add cards before saving.');
    return;
  }
  
  // Get deck name from user
  const deckName = prompt('Enter a name for your deck:', 
    `${state.gameData?.name || 'Game'} Deck`);
  
  if (!deckName) return; // User cancelled
  
  // Create deck object to save
  const deckToSave = {
    name: deckName,
    gameId: state.gameId,
    createdAt: new Date().toISOString(),
    cards: state.deck
  };
  
  try {
    // Get existing decks or initialize empty array
    const savedDecks = JSON.parse(localStorage.getItem('tcgworld_saved_decks') || '[]');
    
    // Check if deck with same name exists
    const existingDeckIndex = savedDecks.findIndex(deck => 
      deck.name === deckName && deck.gameId === state.gameId);
    
    if (existingDeckIndex >= 0) {
      // Confirm before overwriting
      if (confirm(`A deck named "${deckName}" already exists. Overwrite it?`)) {
        savedDecks[existingDeckIndex] = deckToSave;
      } else {
        return; // User cancelled overwrite
      }
    } else {
      // Add new deck
      savedDecks.push(deckToSave);
    }
    
    // Save back to localStorage
    localStorage.setItem('tcgworld_saved_decks', JSON.stringify(savedDecks));
    alert(`Deck "${deckName}" saved successfully.`);
    
  } catch (error) {
    console.error('Error saving deck:', error);
    alert('Failed to save deck. Please try again.');
  }
}

/**
 * Import a saved deck
 */
function importDeck() {
  try {
    // Get saved decks
    const savedDecks = JSON.parse(localStorage.getItem('tcgworld_saved_decks') || '[]');
    
    // Filter decks for current game
    const gameDecks = savedDecks.filter(deck => deck.gameId === state.gameId);
    
    if (gameDecks.length === 0) {
      alert('No saved decks found for this game.');
      return;
    }
    
    // Create deck selection UI
    const deckSelection = document.createElement('div');
    deckSelection.className = 'deck-selection';
    deckSelection.innerHTML = `
      <div class="deck-selection-header">
        <h3>Select a deck to import</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="deck-selection-list">
        ${gameDecks.map((deck, index) => `
          <div class="saved-deck" data-index="${index}">
            <span class="saved-deck-name">${deck.name}</span>
            <span class="saved-deck-info">${deck.cards.reduce((sum, card) => sum + card.quantity, 0)} cards</span>
            <span class="saved-deck-date">${new Date(deck.createdAt).toLocaleDateString()}</span>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .deck-selection {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        width: 400px;
        max-width: 90vw;
        z-index: 1000;
      }
      .deck-selection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #eee;
      }
      .deck-selection-header h3 {
        margin: 0;
      }
      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
      }
      .deck-selection-list {
        max-height: 300px;
        overflow-y: auto;
        padding: 8px;
      }
      .saved-deck {
        padding: 10px;
        border-radius: 4px;
        margin-bottom: 8px;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        background: #f8f9fa;
      }
      .saved-deck:hover {
        background: #f1f3f4;
      }
      .saved-deck-name {
        font-weight: bold;
      }
      .saved-deck-info, .saved-deck-date {
        color: #666;
        font-size: 0.9em;
      }
      .overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }
    `;
    
    // Create backdrop overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    
    // Add to DOM
    document.body.appendChild(style);
    document.body.appendChild(overlay);
    document.body.appendChild(deckSelection);
    
    // Close modal handler
    const closeModal = () => {
      document.body.removeChild(style);
      document.body.removeChild(overlay);
      document.body.removeChild(deckSelection);
    };
    
    // Add event listeners
    deckSelection.querySelector('.close-btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Handle deck selection
    deckSelection.querySelectorAll('.saved-deck').forEach(element => {
      element.addEventListener('click', () => {
        const index = parseInt(element.dataset.index);
        const selectedDeck = gameDecks[index];
        
        // Confirm before replacing current deck
        if (state.deck.length > 0) {
          if (!confirm('This will replace your current deck. Continue?')) {
            return; // User cancelled
          }
        }
        
        // Load the deck
        state.deck = [...selectedDeck.cards]; // Clone the cards array
        renderDeck();
        renderCards(); // Update highlights
        
        // Close the modal
        closeModal();
      });
    });
    
  } catch (error) {
    console.error('Error importing deck:', error);
    alert('Failed to import deck. Please try again.');
  }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', initializeDeckbuilder);