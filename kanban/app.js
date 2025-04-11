// Data structure for Kanban board
let kanbanData = {
    backlog: [],
    'in-progress': [],
    testing: [],
    done: []
};

// Features from the requirements
const features = [
    {
        id: 1,
        title: '3D Scene',
        description: 'Implement a 3D scene for visualizing cards and game elements',
        priority: 'high',
        status: 'backlog'
    },
    {
        id: 2,
        title: 'Basic Card and Groups of Cards Data Structures',
        description: 'Implement the core data structures for cards and card groups',
        priority: 'high',
        status: 'backlog'
    },
    {
        id: 3,
        title: 'Basic GUI',
        description: 'Create a basic GUI where users can see cards and groups of cards',
        priority: 'medium',
        status: 'backlog'
    },
    {
        id: 4,
        title: 'JSON Schema and Parser',
        description: 'Develop a JSON schema and parser for groups and group positions',
        priority: 'medium',
        status: 'backlog'
    }
];

// DOM Elements
const columns = document.querySelectorAll('.column');
const cardContainers = document.querySelectorAll('.card-container');
const addCardBtns = document.querySelectorAll('.add-card-btn');
const modal = document.getElementById('card-modal');
const closeBtn = document.querySelector('.close-btn');
const cardForm = document.getElementById('card-form');
const modalTitle = document.getElementById('modal-title');
const cardTitleInput = document.getElementById('card-title');
const cardDescInput = document.getElementById('card-description');
const cardPrioritySelect = document.getElementById('card-priority');
const saveCardBtn = document.getElementById('save-card-btn');

// Utility variables
let nextCardId = 5; // Starting after pre-loaded features
let currentEditingCardId = null;
let currentStatusColumn = null;

// Initialize the board
function initializeBoard() {
    // Load features into the kanban board
    features.forEach(feature => {
        kanbanData[feature.status].push(feature);
    });
    
    // Load from localStorage if available
    const savedData = localStorage.getItem('kanbanData');
    if (savedData) {
        try {
            kanbanData = JSON.parse(savedData);
            // Update nextCardId based on highest id in saved data
            Object.values(kanbanData).flat().forEach(card => {
                if (card.id >= nextCardId) {
                    nextCardId = card.id + 1;
                }
            });
        } catch (e) {
            console.error('Error loading saved kanban data:', e);
        }
    }
    
    // Render the board
    renderBoard();
}

// Save board data to localStorage
function saveBoard() {
    localStorage.setItem('kanbanData', JSON.stringify(kanbanData));
}

// Render the entire board
function renderBoard() {
    // Clear all card containers
    cardContainers.forEach(container => {
        container.innerHTML = '';
    });
    
    // Render cards for each column
    columns.forEach(column => {
        const status = column.id;
        const container = column.querySelector('.card-container');
        
        kanbanData[status].forEach(card => {
            container.appendChild(createCardElement(card));
        });
    });
}

// Create a card DOM element
function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.setAttribute('draggable', 'true');
    cardEl.dataset.id = card.id;
    
    const priorityClass = `priority-${card.priority}`;
    
    cardEl.innerHTML = `
        <div class="card-title">${card.title}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-priority ${priorityClass}">${card.priority}</div>
        <div class="card-actions">
            <button class="edit-btn" data-id="${card.id}">Edit</button>
            <button class="delete-btn" data-id="${card.id}">Delete</button>
        </div>
    `;
    
    // Add event listeners for the card
    cardEl.addEventListener('dragstart', handleDragStart);
    cardEl.addEventListener('dragend', handleDragEnd);
    
    // Add event listeners for edit and delete buttons
    cardEl.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openEditCardModal(card.id);
    });
    
    cardEl.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteCard(card.id);
    });
    
    return cardEl;
}

// Handle opening the modal for adding a new card
function openAddCardModal(status) {
    modalTitle.textContent = 'Add New Card';
    cardTitleInput.value = '';
    cardDescInput.value = '';
    cardPrioritySelect.value = 'medium';
    currentEditingCardId = null;
    currentStatusColumn = status;
    modal.style.display = 'block';
}

// Handle opening the modal for editing a card
function openEditCardModal(cardId) {
    // Find the card in all columns
    let cardToEdit = null;
    let cardStatus = null;
    
    for (const status in kanbanData) {
        const found = kanbanData[status].find(card => card.id === cardId);
        if (found) {
            cardToEdit = found;
            cardStatus = status;
            break;
        }
    }
    
    if (cardToEdit) {
        modalTitle.textContent = 'Edit Card';
        cardTitleInput.value = cardToEdit.title;
        cardDescInput.value = cardToEdit.description;
        cardPrioritySelect.value = cardToEdit.priority;
        currentEditingCardId = cardId;
        currentStatusColumn = cardStatus;
        modal.style.display = 'block';
    }
}

// Handle deleting a card
function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card?')) {
        for (const status in kanbanData) {
            kanbanData[status] = kanbanData[status].filter(card => card.id !== cardId);
        }
        saveBoard();
        renderBoard();
    }
}

// Handle saving a card (new or edit)
function saveCard(event) {
    event.preventDefault();
    
    const title = cardTitleInput.value.trim();
    const description = cardDescInput.value.trim();
    const priority = cardPrioritySelect.value;
    
    if (!title) {
        alert('Please enter a title for the card');
        return;
    }
    
    if (currentEditingCardId === null) {
        // Add new card
        const newCard = {
            id: nextCardId++,
            title,
            description,
            priority,
            status: currentStatusColumn
        };
        
        kanbanData[currentStatusColumn].push(newCard);
    } else {
        // Update existing card
        for (const status in kanbanData) {
            const index = kanbanData[status].findIndex(card => card.id === currentEditingCardId);
            
            if (index !== -1) {
                if (status === currentStatusColumn) {
                    // Update in the same column
                    kanbanData[status][index] = {
                        ...kanbanData[status][index],
                        title,
                        description,
                        priority
                    };
                } else {
                    // Move to a different column
                    const cardToMove = kanbanData[status][index];
                    kanbanData[status].splice(index, 1);
                    kanbanData[currentStatusColumn].push({
                        ...cardToMove,
                        title,
                        description,
                        priority,
                        status: currentStatusColumn
                    });
                }
                break;
            }
        }
    }
    
    saveBoard();
    renderBoard();
    closeModal();
}

// Close the modal
function closeModal() {
    modal.style.display = 'none';
    currentEditingCardId = null;
    currentStatusColumn = null;
}

// Drag and Drop Handlers
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drop-zone');
}

function handleDragLeave(e) {
    this.classList.remove('drop-zone');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drop-zone');
    
    const cardId = parseInt(e.dataTransfer.getData('text/plain'));
    const targetStatus = this.closest('.column').id;
    
    // Find the card in all columns
    let foundCard = null;
    let sourceStatus = null;
    
    for (const status in kanbanData) {
        const index = kanbanData[status].findIndex(card => card.id === cardId);
        if (index !== -1) {
            foundCard = kanbanData[status][index];
            sourceStatus = status;
            break;
        }
    }
    
    if (foundCard && sourceStatus !== targetStatus) {
        // Remove from source column
        kanbanData[sourceStatus] = kanbanData[sourceStatus].filter(card => card.id !== cardId);
        
        // Add to target column
        kanbanData[targetStatus].push({
            ...foundCard,
            status: targetStatus
        });
        
        saveBoard();
        renderBoard();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    
    // Add Card buttons
    addCardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.closest('.column').id;
            openAddCardModal(status);
        });
    });
    
    // Close modal button
    closeBtn.addEventListener('click', closeModal);
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Save card form submission
    cardForm.addEventListener('submit', saveCard);
    
    // Set up drag and drop on card containers
    cardContainers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
    });
    
    // Export/Import functionality can be added later
});

// Generate JSON export of board data
function exportBoardData() {
    const dataStr = JSON.stringify(kanbanData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'kanban-board-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import board data from JSON
function importBoardData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        // Validate the data structure (basic validation)
        if (data && typeof data === 'object' && 
            'backlog' in data && 
            'in-progress' in data && 
            'testing' in data && 
            'done' in data) {
            
            kanbanData = data;
            
            // Update nextCardId based on highest id in imported data
            nextCardId = 1;
            Object.values(kanbanData).flat().forEach(card => {
                if (card.id >= nextCardId) {
                    nextCardId = card.id + 1;
                }
            });
            
            saveBoard();
            renderBoard();
            return true;
        } else {
            throw new Error('Invalid data structure');
        }
    } catch (e) {
        console.error('Error importing data:', e);
        alert('Failed to import data: ' + e.message);
        return false;
    }
}