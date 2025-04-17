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
    document.getElementById("gameName").innerText = data.gameName;
    document.getElementById("cardCount").innerText = `Cards: ${data.cardCount}`;
  });

document.getElementById("uploadBtn").addEventListener("click", async () => {
const input = document.getElementById("cardUploader");
const files = input.files;
const status = document.getElementById("uploadStatus");

if (files.length === 0) {
    status.innerText = "No files selected.";
    return;
}

const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId");

for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("name", file.name);

    const res = await fetch(`https://tcg-world-backend-production.up.railway.app/api/games/${gameId}/cards`, {
    method: "POST",
    headers: {
        Authorization: `Bearer ${token}`
    },
    body: formData
    });

    if (res.ok) {
        status.innerText = `Uploaded files`;
    } else {
        const err = await res.json();
        status.innerText = `Failed to upload ${file.name}: ${err.error}`;
    }
}
});

