const token = localStorage.getItem("token");
if (!token) window.location.href = "/login.html";

fetch("https://tcg-world-backend-production.up.railway.app/api/me", {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => {
	if (data.email) {
	  document.getElementById("email").innerText = `Logged in as: ${data.email}`;
	} else {
	  window.location.href = "/login.html";
	}
  });
  
fetch("https://tcg-world-backend-production.up.railway.app/api/games", {
	headers: { Authorization: `Bearer ${token}` }
})
	.then (res => res.json())
	.then (data => {
		if(data.length > 0) {
			const gamesDiv = document.getElementById('games');
			gamesDiv.innerHTML = "<h3>Your Games</h3>";
			
			data.forEach(game => {
				const link = document.createElement("a");
				link.href = `game.html?gameId=${game.id}`;
				link.innerText = game.name;
				link.style.display = "block";
				gamesDiv.appendChild(link);
			})
		}
	});
		}
	});

document.getElementById('createGameBtn').addEventListener('click', async () => {
	const token = localStorage.getItem('token');
	const gameName = prompt('Enter a name for your game');

	if (!gameName) return;

	const res = await fetch('https://tcg-world-backend-production.up.railway.app/api/games', {
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
	}else{
		const err = await res.json();
		alert('Failed to create game: ' + err.error);
	}
});