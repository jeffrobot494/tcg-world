const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId");

const token = localStorage.getItem("token");
const API_URL = "https://tcg-world-backend-production.up.railway.app";

// Modal elements
const addCardBtn = document.getElementById('addCardBtn');
const modal = document.getElementById('addCardModal');
const closeModal = document.querySelector('.close-modal');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Open modal
addCardBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

// Close modal
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Tab functionality
tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons and contents
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    button.classList.add('active');
    const tabName = button.getAttribute('data-tab');
    document.getElementById(`${tabName}Tab`).classList.add('active');
  });
});

// Function to render the card table
function renderCardTable(images) {
  const tableBody = document.querySelector('#cardTable tbody');
  
  if (!images || images.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 30px;">
          No cards yet. Click the "Add Cards" button to get started.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = images.map(img => `
    <tr data-card-id="${img.id}">
      <td>
        <img src="${img.cloudinary_url}" alt="${img.file_name}" class="card-image-thumbnail">
      </td>
      <td>${img.file_name}</td>
      <td>
        <label class="visibility-toggle">
          <input type="checkbox" ${img.visible ? 'checked' : ''}>
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
    const gameName = data.gameName || 'Game';
    const cardCount = data.cardCount || 0;
    
    document.getElementById("gameName").innerText = gameName;
    document.getElementById("cardCount").innerText = `Cards: ${cardCount}`;
    
    // Update deckbuilder link with the current game ID
    const deckbuilderLink = document.getElementById("deckbuilderLink");
    if (deckbuilderLink) {
      deckbuilderLink.href = `deckbuilder.html?gameId=${gameId}`;
    }
    
    // Populate sheet mappings if available
    if (data.sheetMappings && data.sheetMappings.length > 0) {
      const mappingsList = document.querySelector(".sheet-mappings-list");
      const syncSelector = document.getElementById("syncSheetType");
      
      if (mappingsList) {
        // Populate the mappings list
        mappingsList.innerHTML = data.sheetMappings.map(mapping => `
          <div class="sheet-mapping">
            <strong>${mapping.card_type}:</strong> 
            <span class="sheet-url">${mapping.sheet_url}</span>
            <span class="last-refreshed">
              ${mapping.last_refreshed_at ? 
                `Last refreshed: ${new Date(mapping.last_refreshed_at).toLocaleString()}` : 
                'Not yet refreshed'}
            </span>
          </div>
        `).join('');
        
        // Populate the sync selector dropdown
        syncSelector.innerHTML = '<option value="">Select card type to sync</option>';
        data.sheetMappings.forEach(mapping => {
          syncSelector.innerHTML += `<option value="${mapping.card_type}">${mapping.card_type}</option>`;
        });
        
        // Enable the sync button when a card type is selected
        syncSelector.addEventListener('change', () => {
          document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
        });
      }
    }
    
    // Fetch images
    return fetch(`${API_URL}/api/games/${gameId}/images`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  })
  .then(res => res.json())
  .then(images => {
    renderCardTable(images);
  })
  .catch(err => {
    console.error("Error fetching game data:", err);
  });

  document.getElementById("uploadBtn").addEventListener("click", async () => {
    const input = document.getElementById("cardUploader");
    const files = input.files;
    const status = document.getElementById("uploadStatus");
  
    if (files.length === 0) {
      status.innerText = "No files selected.";
      return;
    }
  
    status.innerText = "Uploading...";
  
    const uploadToCloudinary = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "TCG-World Unsigned");
  
      const res = await fetch("https://api.cloudinary.com/v1_1/dmfjx6e7z/image/upload", {
        method: "POST",
        body: formData
      });
  
      if (!res.ok) throw new Error("Cloudinary upload failed");
  
      const data = await res.json();
      return data.secure_url;
    };
  
    let uploadedCount = 0;
    let failedCount = 0;
  
    for (const file of files) {
      try {
        const imageUrl = await uploadToCloudinary(file);
  
        const res = await fetch(`${API_URL}/api/games/${gameId}/cards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: file.name,
            imageUrl: imageUrl
          })
        });
  
        const data = await res.json();
  
        if (res.ok) {
          uploadedCount++;
          status.innerHTML = `Uploaded ${uploadedCount} of ${files.length} cards`;
          console.log("Uploaded to:", data.imageUrl);
        } else {
          failedCount++;
          
          // Create status message with error details
          let statusMsg = `Uploaded ${uploadedCount}, failed ${failedCount} of ${files.length} cards`;
          
          // Add specific error message if available
          if (data.error) {
            statusMsg += `<br><small style="color: red;">${file.name}: ${data.error}</small>`;
          }
          
          status.innerHTML = statusMsg;
          console.error(`Failed to upload ${file.name}: ${data.error}`);
        }
  
      } catch (err) {
        failedCount++;
        console.error("Upload error:", err);
        status.innerText = `Uploaded ${uploadedCount}, failed ${failedCount} of ${files.length} cards`;
      }
    }
    
    // After uploads are done, refresh the card table
    fetch(`${API_URL}/api/games/${gameId}/cards`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(cards => {
      renderCardTable(cards);
      
      // Update card count display
      document.getElementById("cardCount").innerText = `Cards: ${cards.length}`;
      
      if (uploadedCount > 0) {
        // Close modal after successful upload
        setTimeout(() => {
          modal.style.display = 'none';
        }, 1500);
      }
    });
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
        
        // Close modal after successful link
        setTimeout(() => {
          modal.style.display = 'none';
        }, 1500);
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
      // Update sheet mappings
      if (data.sheetMappings && data.sheetMappings.length > 0) {
        const mappingsList = document.querySelector(".sheet-mappings-list");
        const syncSelector = document.getElementById("syncSheetType");
        
        if (mappingsList) {
          // Update mappings list
          mappingsList.innerHTML = data.sheetMappings.map(mapping => `
            <div class="sheet-mapping">
              <strong>${mapping.card_type}:</strong> 
              <span class="sheet-url">${mapping.sheet_url}</span>
              <span class="last-refreshed">
                ${mapping.last_refreshed_at ? 
                  `Last refreshed: ${new Date(mapping.last_refreshed_at).toLocaleString()}` : 
                  'Not yet refreshed'}
              </span>
            </div>
          `).join('');
          
          // Update sync selector
          const currentSelection = syncSelector.value;
          syncSelector.innerHTML = '<option value="">Select card type to sync</option>';
          
          data.sheetMappings.forEach(mapping => {
            const selected = mapping.card_type === currentSelection ? 'selected' : '';
            syncSelector.innerHTML += `<option value="${mapping.card_type}" ${selected}>${mapping.card_type}</option>`;
          });
          
          // Enable/disable sync button
          document.getElementById('syncSheetBtn').disabled = !syncSelector.value;
        }
      }
    })
    .catch(err => {
      console.error("Error refreshing game data:", err);
    });
  }
  

