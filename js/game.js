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
    const gameId = new URLSearchParams(window.location.search).get("gameId");
  
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
  
    for (const file of files) {
      try {
        const imageUrl = await uploadToCloudinary(file);
  
        const res = await fetch(`https://tcg-world-backend-production.up.railway.app/api/games/${gameId}/cards`, {
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
          status.innerText = `Uploaded ${file.name}`;
          console.log("Uploaded to:", data.imageUrl);
        } else {
          status.innerText = `Failed to upload ${file.name}: ${data.error}`;
        }
  
      } catch (err) {
        console.error("Upload error:", err);
        status.innerText = `Failed to upload ${file.name}: ${err.message}`;
      }
    }
  });
  

