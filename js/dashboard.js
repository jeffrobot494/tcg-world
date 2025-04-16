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
			const names = data.map(game => game.name).join(', ');
			document.getElementById("games").innerText = `Your games: ${data.name}`;
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