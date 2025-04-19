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
const uploadImagesBtn = document.getElementById('uploadImagesBtn');
const uploadStatus = document.getElementById('uploadStatus');
const gameNameElement = document.getElementById('gameName');
const gameIdElement = document.getElementById('gameId');
const backLink = document.getElementById('backLink');
gameIdElement.textContent = gameId;

// Global variable for uploaded images
let uploadedImages = [];

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
    
    // Enable upload button
    uploadImagesBtn.disabled = false;
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

// Upload files to the server
async function uploadFiles() {
    if (!window.selectedImageFiles || window.selectedImageFiles.length === 0) {
        uploadStatus.textContent = 'No images selected. Please select a folder first.';
        return;
    }
    
    const imageFiles = window.selectedImageFiles;
    uploadStatus.textContent = `Uploading 0/${imageFiles.length} images...`;
    uploadedImages = [];
    
    let successCount = 0;
    let errorCount = 0;
    
    // Disable upload button during upload
    uploadImagesBtn.disabled = true;
    
    for (let i = 0; i < imageFiles.length; i++) {
        const {file, path, name} = imageFiles[i];
        
        try {
            // Upload to Cloudinary first
            const cloudinaryFormData = new FormData();
            cloudinaryFormData.append('file', file);
            cloudinaryFormData.append('upload_preset', 'TCG-World Unsigned');
            
            const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dmfjx6e7z/image/upload', {
                method: 'POST',
                body: cloudinaryFormData
            });
            
            if (!cloudinaryResponse.ok) {
                throw new Error(`Failed to upload to Cloudinary: ${cloudinaryResponse.statusText}`);
            }
            
            const cloudinaryData = await cloudinaryResponse.json();
            const imageUrl = cloudinaryData.secure_url;
            
            // Save to our backend using the upload-card endpoint
            const response = await fetch(`${API_URL}/api/games/${gameId}/upload-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    display_name: name,
                    file_name: name,
                    image_url: imageUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save card: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Add to uploaded images array
            uploadedImages.push({
                file_name: name,
                image_url: imageUrl,
                path: path
            });
            
            successCount++;
        } catch (error) {
            console.error(`Error uploading ${name}:`, error);
            errorCount++;
        }
        
        // Update status
        uploadStatus.textContent = `Uploading ${i + 1}/${imageFiles.length} images... (${successCount} succeeded, ${errorCount} failed)`;
    }
    
    // Final status update
    uploadStatus.textContent = `Upload complete. ${successCount} images uploaded successfully, ${errorCount} failed.`;
    
    // Re-enable upload button
    uploadImagesBtn.disabled = false;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchGameDetails();
    fetchUserInfo();
    
    // Add event listener for folder selection
    selectFolderBtn.addEventListener('click', selectFolder);
    
    // Add event listener for image upload
    uploadImagesBtn.addEventListener('click', uploadFiles);
});