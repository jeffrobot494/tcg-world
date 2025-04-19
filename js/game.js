const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId");

const token = localStorage.getItem("token");
const API_URL = "https://tcg-world-backend-production.up.railway.app";

// Function to render the card table
function renderCardTable(cards) {
  const tableBody = document.querySelector('#cardTable tbody');
  
  if (!cards || cards.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 30px;">
          No cards yet. Use the Uploader to add cards.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = cards.map(card => `
    <tr data-card-id="${card.id}" data-file-name="${card.file_name}">
      <td>
        <img src="${card.image_url}" alt="${card.display_name || card.file_name}" class="card-image-thumbnail">
      </td>
      <td>${card.display_name}</td>
      <td>${card.file_name}</td>
      <td>
        <label class="visibility-toggle">
          <input type="checkbox" ${card.visible ? 'checked' : ''}>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <button class="icon-button edit-card" title="Edit Card">
          <i class="fas fa-edit"></i>
        </button>
        <button class="icon-button delete-card" title="Delete Card">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
  
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-card').forEach(button => {
    button.addEventListener('click', handleDeleteCard);
  });
}

// Function to handle card deletion
async function handleDeleteCard(event) {
  // Find the card row
  const cardRow = event.target.closest('tr');
  const cardId = cardRow.dataset.cardId;
  const fileName = cardRow.dataset.fileName;
  
  // Ask for confirmation
  if (!confirm(`Are you sure you want to delete the card "${fileName}"?`)) {
    return; // User cancelled
  }
  
  try {
    // Send delete request to the backend
    const response = await fetch(`${API_URL}/api/games/${gameId}/cards/${cardId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Remove the row from the table
      cardRow.remove();
      
      // Update card count
      const cardCountEl = document.getElementById('cardCount');
      const currentCount = parseInt(cardCountEl.textContent.match(/\d+/)[0] || '0');
      cardCountEl.textContent = `Cards: ${Math.max(0, currentCount - 1)}`;
      
      // Show success message
      showNotification('Card deleted successfully', 'success');
    } else {
      throw new Error(data.error || 'Failed to delete card');
    }
  } catch (error) {
    console.error('Error deleting card:', error);
    showNotification(`Error: ${error.message}`, 'error');
  }
}

// Function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element if it doesn't exist
  let notificationEl = document.getElementById('notification');
  if (!notificationEl) {
    notificationEl = document.createElement('div');
    notificationEl.id = 'notification';
    notificationEl.className = 'notification';
    document.body.appendChild(notificationEl);
    
    // Add styles if not already in CSS
    if (!document.querySelector('style#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px 20px;
          border-radius: 4px;
          color: white;
          font-weight: bold;
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 1000;
        }
        .notification.show {
          opacity: 1;
        }
        .notification.info {
          background-color: #2196F3;
        }
        .notification.success {
          background-color: #4CAF50;
        }
        .notification.error {
          background-color: #F44336;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  // Set message and type
  notificationEl.textContent = message;
  notificationEl.className = `notification ${type}`;
  
  // Show notification
  setTimeout(() => notificationEl.classList.add('show'), 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notificationEl.classList.remove('show');
    setTimeout(() => {
      notificationEl.textContent = '';
    }, 300);
  }, 3000);
}


// Fetch game data
fetch(`${API_URL}/api/games/${gameId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    // Handle potentially missing data with default values
    const gameName = data.name || 'Game';
    const cardCount = data.card_count || 0;
    
    document.getElementById("gameName").innerText = gameName;
    document.getElementById("cardCount").innerText = `Cards: ${cardCount}`;
    
    // Update deckbuilder link with the current game ID
    const deckbuilderLink = document.getElementById("deckbuilderLink");
    if (deckbuilderLink) {
      deckbuilderLink.href = `deckbuilder.html?gameId=${gameId}`;
    }
    
    // Update uploader link with the current game ID
    const uploaderLink = document.getElementById("uploaderLink");
    if (uploaderLink) {
      uploaderLink.href = `uploader.html?gameId=${gameId}`;
    }
    
    // Populate card types if available
    if (data.card_types && data.card_types.length > 0) {
      const mappingsList = document.querySelector(".sheet-mappings-list");
      const syncSelector = document.getElementById("syncSheetType");
      
      if (mappingsList) {
        // Populate the mappings list
        mappingsList.innerHTML = data.card_types.map(type => `
          <div class="sheet-mapping">
            <strong>${type.name}:</strong> 
            <span class="sheet-url">${type.sheet_url}</span>
            <span class="last-refreshed">
              ${type.last_refreshed_at ? 
                `Last refreshed: ${new Date(type.last_refreshed_at).toLocaleString()}` : 
                'Not yet refreshed'}
            </span>
          </div>
        `).join('');
        
        // Populate the sync selector dropdown
        syncSelector.innerHTML = '<option value="">Select card type to sync</option>';
        data.card_types.forEach(type => {
          syncSelector.innerHTML += `<option value="${type.name}">${type.name}</option>`;
        });
        
        // Enable the sync button when a card type is selected
        syncSelector.addEventListener('change', () => {
          document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
        });
      }
    }
    
    // Fetch cards
    return fetch(`${API_URL}/api/games/${gameId}/cards`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  })
  .then(res => res.json())
  .then(cards => {
    renderCardTable(cards);
  })
  .catch(err => {
    console.error("Error fetching game data:", err);
  });

  
  // Link Google Sheet event handler
  // Link Sheet Button Handler
  document.getElementById("linkSheetBtn").addEventListener("click", async () => {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const cardTypeInput = document.getElementById("cardType") || { value: "default" };
    const cardType = cardTypeInput.value.trim();
    const statusEl = document.getElementById("sheetStatus");
    
    if (!sheetUrl) {
      statusEl.innerText = "Please enter a Google Sheets URL";
      statusEl.style.color = "red";
      return;
    }
    
    if (!cardType) {
      statusEl.innerText = "Please enter a card type";
      statusEl.style.color = "red";
      return;
    }
    
    // Basic validation for Google Sheets URL
    if (!sheetUrl.includes("docs.google.com/spreadsheets")) {
      statusEl.innerText = "Please enter a valid Google Sheets URL";
      statusEl.style.color = "red";
      return;
    }
    
    statusEl.innerText = "Linking sheet...";
    statusEl.style.color = "black";
    
    try {
      const res = await fetch(`${API_URL}/api/games/${gameId}/sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sheetUrl, cardType })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        statusEl.innerText = `Sheet linked successfully for ${cardType} cards`;
        statusEl.style.color = "green";
        
        // Clear input fields
        document.getElementById("sheetUrl").value = "";
        document.getElementById("cardType").value = "";
        
        // Refresh the game data to show new sheet mappings
        refreshGameData();
        
        // No longer auto-closing modal after linking sheet
        // User will need to click outside or the X to close it
      } else {
        statusEl.innerText = `Failed to link sheet: ${data.error}`;
        statusEl.style.color = "red";
      }
    } catch (err) {
      console.error("Error linking sheet:", err);
      statusEl.innerText = `Error: ${err.message}`;
      statusEl.style.color = "red";
    }
  });
  
  // Sync Sheet Button Handler
  document.getElementById("syncSheetBtn").addEventListener("click", async () => {
    const cardType = document.getElementById("syncSheetType").value;
    const syncStatusEl = document.getElementById("syncStatus");
    
    if (!cardType) {
      syncStatusEl.innerHTML = `<div class="error">Please select a card type to sync</div>`;
      return;
    }
    
    // Disable the button during sync
    const syncBtn = document.getElementById("syncSheetBtn");
    syncBtn.disabled = true;
    syncBtn.textContent = "Syncing...";
    
    // Show progress indicator
    syncStatusEl.innerHTML = `
      <div>Syncing ${cardType} data...</div>
      <div class="progress-bar">
        <div class="progress-bar-inner" style="width: 25%"></div>
      </div>
    `;
    
    try {
      const res = await fetch(`${API_URL}/api/games/${gameId}/sync-sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cardType })
      });
      
      const data = await res.json();
      
      // Update progress
      syncStatusEl.querySelector('.progress-bar-inner').style.width = '100%';
      
      if (res.ok) {
        // Success response
        const summary = data.summary;
        let statusHtml = `
          <div class="success">
            <strong>Sheet sync complete!</strong><br>
            Processed ${summary.totalRows} rows<br>
            Successfully imported: ${summary.importedCount}<br>
            Errors: ${summary.errorCount}
          </div>
        `;
        
        // Show errors if any
        if (summary.errorCount > 0 && summary.errors.length > 0) {
          statusHtml += `
            <div class="sync-errors">
              <strong>Error details:</strong><br>
              ${summary.errors.map(err => `- ${err}`).join('<br>')}
              ${summary.errorCount > summary.errors.length ? 
                `<br>...and ${summary.errorCount - summary.errors.length} more errors` : ''}
            </div>
          `;
        }
        
        syncStatusEl.innerHTML = statusHtml;
        
        // Refresh the game data to update timestamps
        refreshGameData();
      } else {
        // Error response
        syncStatusEl.innerHTML = `<div class="error">Sync failed: ${data.error}</div>`;
      }
    } catch (err) {
      console.error("Error syncing sheet:", err);
      syncStatusEl.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    } finally {
      // Re-enable the button
      syncBtn.disabled = false;
      syncBtn.textContent = "Refresh Data";
    }
  });
  
  // Helper function to refresh game data
  function refreshGameData() {
    fetch(`${API_URL}/api/games/${gameId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      // Update card types
      if (data.card_types && data.card_types.length > 0) {
        const mappingsList = document.querySelector(".sheet-mappings-list");
        const syncSelector = document.getElementById("syncSheetType");
        
        if (mappingsList) {
          // Update mappings list
          mappingsList.innerHTML = data.card_types.map(type => `
            <div class="sheet-mapping">
              <strong>${type.name}:</strong> 
              <span class="sheet-url">${type.sheet_url}</span>
              <span class="last-refreshed">
                ${type.last_refreshed_at ? 
                  `Last refreshed: ${new Date(type.last_refreshed_at).toLocaleString()}` : 
                  'Not yet refreshed'}
              </span>
            </div>
          `).join('');
          
          // Update sync selector
          const currentSelection = syncSelector.value;
          syncSelector.innerHTML = '<option value="">Select card type to sync</option>';
          
          data.card_types.forEach(type => {
            const selected = type.name === currentSelection ? 'selected' : '';
            syncSelector.innerHTML += `<option value="${type.name}" ${selected}>${type.name}</option>`;
          });
          
          // Enable/disable sync button
          document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
          
          // Re-attach change event listener
          syncSelector.addEventListener('change', () => {
            document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
          });
          
          // Re-attach change event listener
          syncSelector.addEventListener('change', () => {
            document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
          });
        }
      }
    })
    .catch(err => {
      console.error("Error refreshing game data:", err);
    });
  }
  

