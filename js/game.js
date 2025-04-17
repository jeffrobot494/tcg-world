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
function renderCardTable(cards) {
  const tableBody = document.querySelector('#cardTable tbody');
  
  if (!cards || cards.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 30px;">
          No cards yet. Click the "Add Cards" button to get started.
        </td>
      </tr>
    `;
    return;
  }
  
  tableBody.innerHTML = cards.map(card => `
    <tr data-card-id="${card.id}">
      <td>
        <img src="${card.image_url}" alt="${card.name}" class="card-image-thumbnail">
      </td>
      <td>${card.name}</td>
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
}

// Fetch game data
fetch(`${API_URL}/api/games/${gameId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    document.getElementById("gameName").innerText = data.gameName;
    document.getElementById("cardCount").innerText = `Cards: ${data.cardCount}`;
    
    // Update deckbuilder link with the current game ID
    const deckbuilderLink = document.getElementById("deckbuilderLink");
    if (deckbuilderLink) {
      deckbuilderLink.href = `deckbuilder.html?gameId=${gameId}`;
    }
    
    // Set sheet URL if available (legacy)
    if (data.sheetUrl) {
      document.getElementById("sheetUrl").value = data.sheetUrl;
      document.getElementById("sheetStatus").innerText = "Sheet currently linked";
      document.getElementById("sheetStatus").style.color = "green";
    }
    
    // Populate sheet mappings if available
    if (data.sheetMappings && data.sheetMappings.length > 0) {
      const mappingsList = document.getElementById("sheetMappings");
      if (mappingsList) {
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
      }
    }
    
    // Use the newer images endpoint if available
    try {
      return fetch(`${API_URL}/api/games/${gameId}/images`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (err) {
      // Fall back to the old cards endpoint
      return fetch(`${API_URL}/api/games/${gameId}/cards`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  })
  .then(res => res.json())
  .then(images => {
    // Convert image data to card format for the table
    const cards = images.map(img => ({
      id: img.id,
      name: img.file_name || img.name,
      image_url: img.cloudinary_url || img.image_url
    }));
    
    renderCardTable(cards);
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
          status.innerText = `Uploaded ${uploadedCount} of ${files.length} cards`;
          console.log("Uploaded to:", data.imageUrl);
        } else {
          failedCount++;
          status.innerText = `Uploaded ${uploadedCount}, failed ${failedCount} of ${files.length} cards`;
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
        
        // Close modal after successful link
        setTimeout(() => {
          modal.style.display = 'none';
        }, 1500);
        
        // Refresh the game data to show new sheet mappings
        fetch(`${API_URL}/api/games/${gameId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        .then(res => res.json())
        .then(data => {
          // Update sheet mappings display if it exists
          if (document.getElementById("sheetMappings")) {
            const mappingsList = document.getElementById("sheetMappings");
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
          }
        });
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
  

