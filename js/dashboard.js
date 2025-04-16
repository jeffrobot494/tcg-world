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
			document.getElementById("games").innerText = `Your games: ${data}`;
		}
	});