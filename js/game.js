const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId");

const token = localStorage.getItem("token");

fetch(`https://tcg-world-backend-production.up.railway.app/api/games/${gameId}`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    //document.getElementById("gameName").innerText = data.name;
    document.getElementById("cardCount").innerText = `Cards: ${data.cardCount}`;
  });
