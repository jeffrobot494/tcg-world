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
      if(data.length > 0) {
        const gamesDiv = document.getElementById('games');
        gamesDiv.innerHTML = "<h3>Your Games</h3>";
        
        data.forEach(game => {
          // Create a container for each game
          const gameContainer = document.createElement("div");
          
          // Game link
          const link = document.createElement("a");
          link.href = `${window.CONFIG.BASE_HTML_PATH}game.html?gameId=${game.id}`;
          link.innerText = game.name;
          link.style.display = "block";
          gameContainer.appendChild(link);
          
          // Game details line
          const details = document.createElement("div");
          
          // Format date if available
          let dateText = "";
          if (game.created_at) {
            const date = new Date(game.created_at);
            dateText = `Created: ${date.toLocaleDateString()} • `;
          }
          
          // Add card count if available
          const cardCount = typeof game.cardCount === 'number' ? game.cardCount : 0;
          details.innerText = `${dateText}Cards: ${cardCount}`;
          
          gameContainer.appendChild(details);
          gamesDiv.appendChild(gameContainer);
        });
      } else {
        const gamesDiv = document.getElementById('games');
        gamesDiv.innerHTML = "<p>You don't have any games yet. Create one to get started!</p>";
      }
    })
    .catch(error => {
      console.error('Error fetching games:', error);
      document.getElementById('games').innerHTML = '<p>Error loading games</p>';
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