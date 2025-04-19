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
                    file_name: name.toLowerCase(), // Lowercase the filename for consistency
                    image_url: imageUrl
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save card: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Add to uploaded images array with lowercase filename
            uploadedImages.push({
                file_name: name.toLowerCase(), // Store lowercase filename
                original_name: name, // Store original name for display purposes
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
    
    // Display results table if any images were uploaded successfully
    if (successCount > 0) {
        displayResults();
    }
}

// Display uploaded images in the table
function displayResults() {
    const resultsContainer = document.querySelector('.results-container');
    
    // Show results container
    resultsContainer.style.display = 'block';
    
    // Get the table body
    const imagesTable = document.getElementById('imagesTable');
    const tableBody = imagesTable.querySelector('tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Check if we have images to display
    if (uploadedImages.length === 0) {
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 3;
        emptyCell.textContent = 'No images uploaded yet.';
        emptyCell.style.textAlign = 'center';
        emptyCell.style.padding = '20px';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // Sort images by file name
    uploadedImages.sort((a, b) => a.file_name.localeCompare(b.file_name));
    
    // Add rows for each image
    uploadedImages.forEach(image => {
        const row = document.createElement('tr');
        
        // Thumbnail
        const thumbnailCell = document.createElement('td');
        const thumbnail = document.createElement('img');
        thumbnail.src = image.image_url;
        thumbnail.alt = image.file_name;
        thumbnail.className = 'image-thumbnail';
        thumbnailCell.appendChild(thumbnail);
        
        // File name with copy button
        const fileNameCell = document.createElement('td');
        const fileNameContainer = document.createElement('div');
        fileNameContainer.className = 'image-url';
        
        const fileNameText = document.createElement('span');
        fileNameText.className = 'url-text';
        
        // Show the lowercase filename, and the original name if different
        if (image.original_name && image.original_name.toLowerCase() !== image.file_name) {
            fileNameText.innerHTML = `${image.file_name} <small style="color:#999">(original: ${image.original_name})</small>`;
        } else {
            fileNameText.textContent = image.file_name;
        }
        
        const copyBtn = document.createElement('button');
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.className = 'copy-button';
        copyBtn.title = 'Copy File Name';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(image.file_name)
                .then(() => {
                    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
                    }, 1500);
                });
        };
        
        fileNameContainer.appendChild(fileNameText);
        fileNameContainer.appendChild(copyBtn);
        fileNameCell.appendChild(fileNameContainer);
        
        // Image URL
        const urlCell = document.createElement('td');
        const urlText = document.createElement('div');
        urlText.className = 'url-text';
        urlText.textContent = image.image_url;
        urlCell.appendChild(urlText);
        
        // Add cells to row
        row.appendChild(thumbnailCell);
        row.appendChild(fileNameCell);
        row.appendChild(urlCell);
        
        // Add row to table
        tableBody.appendChild(row);
    });
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Google Sheet Validation
async function validateGoogleSheet() {
    const sheetUrlInput = document.getElementById('sheetUrlInput');
    const sheetStatus = document.getElementById('sheetStatus');
    const sheetUrl = sheetUrlInput.value.trim();
    
    if (!sheetUrl) {
        sheetStatus.textContent = 'Please enter a Google Sheet URL';
        return;
    }
    
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
        sheetStatus.textContent = 'Invalid Google Sheet URL. Must be a Google Sheets link.';
        return;
    }
    
    // Update status
    sheetStatus.textContent = 'Validating sheet...';
    
    try {
        const response = await fetch(`${API_URL}/api/games/${gameId}/validate-sheet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sheetUrl })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to validate sheet');
        }
        
        // Update status
        sheetStatus.textContent = 'Sheet validated successfully!';
        
        // Display validation results
        displaySheetValidation(data.validation);
        
    } catch (error) {
        console.error('Error validating sheet:', error);
        sheetStatus.textContent = error.message || 'Error validating sheet';
    }
}

// Display Sheet Validation Results
function displaySheetValidation(validation) {
    const resultsContainer = document.getElementById('sheetValidationResults');
    resultsContainer.style.display = 'block';
    
    // Update summary stats
    document.getElementById('columnCount').textContent = validation.columns.length;
    document.getElementById('rowCount').textContent = validation.record_count;
    document.getElementById('fileNameCol').textContent = validation.columns[validation.file_name_column_index].name;
    
    // Display columns table
    const columnsTable = document.getElementById('sheetColumnsTable');
    const columnsBody = columnsTable.querySelector('tbody');
    columnsBody.innerHTML = '';
    
    validation.columns.forEach(column => {
        const row = document.createElement('tr');
        
        // Column name
        const nameCell = document.createElement('td');
        nameCell.textContent = column.name;
        if (column.file_name_column) {
            nameCell.style.fontWeight = 'bold';
        }
        
        // Data type
        const typeCell = document.createElement('td');
        typeCell.textContent = column.type.toUpperCase();
        
        // Status
        const statusCell = document.createElement('td');
        const statusSpan = document.createElement('span');
        statusSpan.className = 'column-status';
        
        if (column.file_name_column) {
            statusSpan.textContent = 'Required';
            statusSpan.classList.add('status-valid');
        } else if (column.nullable) {
            statusSpan.textContent = 'Optional';
            statusSpan.classList.add('status-warning');
        } else {
            statusSpan.textContent = 'Valid';
            statusSpan.classList.add('status-valid');
        }
        
        statusCell.appendChild(statusSpan);
        
        // Add cells to row
        row.appendChild(nameCell);
        row.appendChild(typeCell);
        row.appendChild(statusCell);
        
        // Add row to table
        columnsBody.appendChild(row);
    });
    
    // Find the sample data section and update heading
    const sampleHeading = document.querySelector('.sheet-validation-results h4:last-of-type');
    sampleHeading.textContent = 'All Records'; // Change heading from "Sample Data" to "All Records"
    
    // Look for existing match summary div to update or remove
    let matchSummaryDiv = document.querySelector('.match-summary');
    if (matchSummaryDiv) {
        // If it exists, update its content
        matchSummaryDiv.innerHTML = `
            <p>Total records: <strong>${validation.match_summary.total}</strong></p>
            <p>Matched with images: <strong>${validation.match_summary.matched}</strong></p>
            <p>Unmatched (no image found): <strong>${validation.match_summary.unmatched}</strong></p>
        `;
    } else {
        // If it doesn't exist yet, create it
        matchSummaryDiv = document.createElement('div');
        matchSummaryDiv.className = 'match-summary';
        matchSummaryDiv.innerHTML = `
            <p>Total records: <strong>${validation.match_summary.total}</strong></p>
            <p>Matched with images: <strong>${validation.match_summary.matched}</strong></p>
            <p>Unmatched (no image found): <strong>${validation.match_summary.unmatched}</strong></p>
        `;
        sampleHeading.parentNode.insertBefore(matchSummaryDiv, sampleHeading);
    }
    
    // Display all data
    const sampleTable = document.getElementById('sampleDataTable');
    const sampleHeader = sampleTable.querySelector('thead tr');
    const sampleBody = sampleTable.querySelector('tbody');
    
    // Clear existing content
    sampleHeader.innerHTML = '';
    sampleBody.innerHTML = '';
    
    // Add headers
    validation.columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.name;
        if (column.file_name_column) {
            th.style.fontWeight = 'bold';
        }
        sampleHeader.appendChild(th);
    });
    
    // Group data by match status (unmatched first, then matched)
    const unmatchedRows = validation.all_data.filter(row => !row.has_match);
    const matchedRows = validation.all_data.filter(row => row.has_match);
    const groupedRows = [...unmatchedRows, ...matchedRows];
    
    // Add all data rows with unmatched rows highlighted
    groupedRows.forEach(rowData => {
        const row = document.createElement('tr');
        
        // Apply special styling for unmatched rows
        if (!rowData.has_match) {
            row.style.backgroundColor = '#fef7e0'; // Light yellow background
        }
        
        validation.columns.forEach((column, index) => {
            const cell = document.createElement('td');
            cell.textContent = rowData.values[index] || '';
            row.appendChild(cell);
        });
        
        sampleBody.appendChild(row);
    });
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchGameDetails();
    fetchUserInfo();
    
    // Add event listener for folder selection
    selectFolderBtn.addEventListener('click', selectFolder);
    
    // Add event listener for image upload
    uploadImagesBtn.addEventListener('click', uploadFiles);
    
    // Add event listener for sheet validation
    const validateSheetBtn = document.getElementById('validateSheetBtn');
    if (validateSheetBtn) {
        validateSheetBtn.addEventListener('click', validateGoogleSheet);
    }
});