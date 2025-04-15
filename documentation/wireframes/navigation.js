// Page navigation script

// Define the page sequence
const pageSequence = [
    'pitch.html',
    'landing-page.html',
    'fantasy-realms.html',
    'deck-builder.html',
    'game-lobby.html',
    'game-screen.html',
    'creator-screen.html',
    'creator-screen-grid.html',
	'tech-architecture.html',
    'tech-problems.html'
];

// Get current page index
function getCurrentPageIndex() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1);
    
    // Handle empty path (which would be the directory index)
    if (!currentPage || currentPage === '') {
        return pageSequence.indexOf('landing-page.html');
    }
    
    return pageSequence.indexOf(currentPage);
}

// Navigate to the previous or next page
function navigatePage(direction) {
    const currentIndex = getCurrentPageIndex();
    
    // If current page not found in sequence, default to first page
    if (currentIndex === -1) {
        window.location.href = pageSequence[0];
        return;
    }
    
    let newIndex;
    if (direction === 'prev') {
        newIndex = (currentIndex - 1 + pageSequence.length) % pageSequence.length;
    } else {
        newIndex = (currentIndex + 1) % pageSequence.length;
    }
    
    window.location.href = pageSequence[newIndex];
}

// Add keyboard event listener
document.addEventListener('keydown', function(event) {
    // Left arrow key
    if (event.key === 'ArrowLeft') {
        navigatePage('prev');
    }
    // Right arrow key
    else if (event.key === 'ArrowRight') {
        navigatePage('next');
    }
});

// Display navigation help
document.addEventListener('DOMContentLoaded', function() {
    // Create navigation helper element
    const navHelper = document.createElement('div');
    navHelper.classList.add('navigation-helper');
    navHelper.innerHTML = `
        <div class="nav-controls">
            <div class="nav-hint left">← Previous</div>
            <div class="page-indicator">
                Page ${getCurrentPageIndex() + 1} of ${pageSequence.length}
            </div>
            <div class="nav-hint right">Next →</div>
        </div>
    `;
    
    // Add styles for the navigation helper
    const navStyle = document.createElement('style');
    navStyle.textContent = `
        .navigation-helper {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background-color: rgba(0, 0, 0, 0.7);
            border-radius: 20px;
            padding: 8px 16px;
            transition: opacity 0.3s ease;
            opacity: 0.3;
        }
        
        .navigation-helper:hover {
            opacity: 1;
        }
        
        .nav-controls {
            display: flex;
            align-items: center;
            gap: 20px;
            color: white;
            font-size: 14px;
        }
        
        .nav-hint {
            opacity: 0.8;
        }
        
        .page-indicator {
            font-weight: bold;
        }
    `;
    
    // Append to document
    document.head.appendChild(navStyle);
    document.body.appendChild(navHelper);
});