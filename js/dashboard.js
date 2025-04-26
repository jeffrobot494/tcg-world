// Wait for DOM to be ready to access elements
document.addEventListener('DOMContentLoaded', function() {
  console.log('Dashboard initialized, using API URL:', window.CONFIG.API_URL);
  
  // Get token from localStorage
  const token = localStorage.getItem("token");
  
  // Redirect to login if no token
  if (!token) {
    window.location.href = `${window.CONFIG.BASE_HTML_PATH}login.html`;
    return;
  }
  
  // Initialize API-dependent functionality
  fetchUserData(token);
  fetchGames(token);
  
  // Set up UI events
  setupCreateGameButton();
  
  // Add logout functionality
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = `${window.CONFIG.BASE_HTML_PATH}login.html`;
    });
  }
});

// Function to fetch user data
function fetchUserData(token) {
  fetch(`${window.CONFIG.API_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      if (data.email) {
        document.getElementById("email").innerText = `Logged in as: ${data.email}`;
      } else {
        window.location.href = `${window.CONFIG.BASE_HTML_PATH}login.html`;
      }
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      document.getElementById("email").innerText = 'Error loading user data';
    });
}

// Function to fetch games
function fetchGames(token) {
  fetch(`${window.CONFIG.API_URL}/api/games`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const gamesContainer = document.getElementById('games');
      
      if(data.length > 0) {
        gamesContainer.innerHTML = ""; // Clear any previous content
        
        data.forEach(game => {
          // Create a game card element
          const gameCard = document.createElement("div");
          gameCard.className = "game-card";
          
          // Game title/link
          const gameLink = document.createElement("a");
          gameLink.href = `${window.CONFIG.BASE_HTML_PATH}game.html?gameId=${game.id}`;
          gameLink.className = "game-link";
          gameLink.innerText = game.name;
          gameCard.appendChild(gameLink);
          
          // Game details
          const gameDetails = document.createElement("div");
          gameDetails.className = "game-details";
          
          // Format date if available
          let dateText = "";
          if (game.created_at) {
            const date = new Date(game.created_at);
            dateText = `Created: ${date.toLocaleDateString()}`;
          }
          
          // Add card count if available
          const cardCount = typeof game.cardCount === 'number' ? game.cardCount : 0;
          gameDetails.innerHTML = `
            <span>${dateText}</span>
            <span>Cards: ${cardCount}</span>
          `;
          gameCard.appendChild(gameDetails);
          
          // Action buttons
          const actionButtons = document.createElement("div");
          actionButtons.className = "game-actions";
          
          // Deckbuilder link
          const deckbuilderLink = document.createElement("a");
          deckbuilderLink.href = `${window.CONFIG.BASE_HTML_PATH}deckbuilder.html?gameId=${game.id}`;
          deckbuilderLink.className = "action-button primary";
          deckbuilderLink.innerText = "View Deck Builder";
          actionButtons.appendChild(deckbuilderLink);
          
          // Game details link
          const detailsLink = document.createElement("a");
          detailsLink.href = `${window.CONFIG.BASE_HTML_PATH}game.html?gameId=${game.id}`;
          detailsLink.className = "action-button";
          detailsLink.innerText = "Manage Game";
          actionButtons.appendChild(detailsLink);
          
          gameCard.appendChild(actionButtons);
          
          // Add to the games container
          gamesContainer.appendChild(gameCard);
        });
      } else {
        gamesContainer.innerHTML = `
          <div class="no-games-message">
            You don't have any games yet. Create one to get started!
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error fetching games:', error);
      document.getElementById('games').innerHTML = '<div class="no-games-message">Error loading games. Please try again later.</div>';
    });
}

// Set up the create game button
function setupCreateGameButton() {
  document.getElementById('createGameBtn').addEventListener('click', async () => {
    try {
      const token = localStorage.getItem('token');
      const gameName = prompt('Enter a name for your game');
      
      if (!gameName) return;
      
      console.log('Creating game using API URL:', window.CONFIG.API_URL);
      
      const res = await fetch(`${window.CONFIG.API_URL}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: gameName})
      });
      
      if (res.ok){
        const newGame = await res.json();
        alert(`Game "${newGame.name}" created!`);
        location.reload();
      } else {
        const err = await res.json();
        alert('Failed to create game: ' + err.error);
      }
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game due to a network error');
    }
  });
}