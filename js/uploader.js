const params = new URLSearchParams(window.location.search);
const gameId = params.get("gameId");
const token = localStorage.getItem("token");
const API_URL = "https://tcg-world-backend-production.up.railway.app";

// Check for auth and game ID
if (!token) {
    window.location.href = "/login.html";
}

if (!gameId) {
    window.location.href = "/dashboard.html";
}

// DOM Elements
const selectFolderBtn = document.getElementById('selectFolderBtn');
const uploadStatus = document.getElementById('uploadStatus');
const gameNameElement = document.getElementById('gameName');
const gameIdElement = document.getElementById('gameId');
const backLink = document.getElementById('backLink');
gameIdElement.textContent = gameId;

// Update the Back to Game link to include the game ID
if (backLink) {
    backLink.href = `game.html?gameId=${gameId}`;
}

// Fetch game details
async function fetchGameDetails() {
    try {
        const response = await fetch(`${API_URL}/api/games/${gameId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch game details');
        }
        
        const game = await response.json();
        gameNameElement.textContent = game.name || 'Card Uploader';
    } catch (error) {
        console.error('Error fetching game details:', error);
        gameNameElement.textContent = 'Card Uploader';
    }
}

// Check if browser supports the File System Access API
function isFileSystemAccessSupported() {
    return 'showDirectoryPicker' in window;
}

// Handle folder selection
async function selectFolder() {
    if (!isFileSystemAccessSupported()) {
        alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.');
        return;
    }
    
    try {
        uploadStatus.textContent = 'Selecting folder...';
        
        // Show directory picker
        const dirHandle = await window.showDirectoryPicker();
        
        // Process files from directory
        uploadStatus.textContent = 'Scanning for image files...';
        await processDirectory(dirHandle);
    } catch (error) {
        console.error('Error selecting folder:', error);
        if (error.name === 'AbortError') {
            // User canceled the selection
            uploadStatus.textContent = 'Folder selection canceled.';
        } else {
            uploadStatus.textContent = `Error: ${error.message}`;
        }
    }
}

// Process directory and its files
async function processDirectory(dirHandle) {
    const imageFiles = [];
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
    
    // Recursively get all image files from the directory
    async function getFilesRecursively(dirHandle, path = '') {
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'directory') {
                await getFilesRecursively(entry, `${path}${entry.name}/`);
            } else if (entry.kind === 'file') {
                const fileName = entry.name.toLowerCase();
                if (imageExtensions.some(ext => fileName.endsWith(ext))) {
                    const file = await entry.getFile();
                    imageFiles.push({
                        file,
                        path: path,
                        name: entry.name
                    });
                }
            }
        }
    }
    
    await getFilesRecursively(dirHandle);
    
    if (imageFiles.length === 0) {
        uploadStatus.textContent = 'No image files found in the selected folder.';
        return;
    }
    
    // Success message for Step 1
    uploadStatus.textContent = `Successfully found ${imageFiles.length} images.`;
    
    // Store the files in a global variable for step 2
    window.selectedImageFiles = imageFiles;
}

// Get user info
async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/api/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        const user = await response.json();
        document.getElementById('email').textContent = `Logged in as: ${user.email}`;
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchGameDetails();
    fetchUserInfo();
    
    // Add event listener for folder selection
    selectFolderBtn.addEventListener('click', selectFolder);
});