// Set default configuration
window.CONFIG = {
  API_URL: "https://tcg-world-backend-production.up.railway.app"
};

// Determine the BASE_HTML_PATH based on the current location
if (window.location.pathname.includes('/html/')) {
  // We're in the HTML directory, so BASE_HTML_PATH is empty (same directory)
  window.CONFIG.BASE_HTML_PATH = '';
} else {
  // We're in the root directory, so HTML files are in the html/ subdirectory
  window.CONFIG.BASE_HTML_PATH = 'html/';
}

// Set other paths
window.CONFIG.BASE_CSS_PATH = window.location.pathname.includes('/html/') ? '../css/' : 'css/';
window.CONFIG.BASE_JS_PATH = window.location.pathname.includes('/html/') ? '../js/' : 'js/';

// Function to check if a file exists synchronously
function fileExists(url) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false); // false makes the request synchronous
    xhr.send();
    return xhr.status !== 404;
  } catch (e) {
    return false;
  }
}

// Function to get the correct path prefix for config files
function getConfigPath() {
  return window.location.pathname.includes('/html/') ? '../' : '';
}

// Wait until DOM is ready to ensure configs are loaded before other scripts run
document.addEventListener('DOMContentLoaded', function() {
  console.log('Config loader running, current configuration:', window.CONFIG);

  // Function to create and inject a script tag
  function injectScript(src) {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
    console.log(`Loaded configuration from: ${src}`);
  }

  const configPath = getConfigPath();
  
  // Check for local config first
  if (fileExists(`${configPath}config.local.js`)) {
    injectScript(`${configPath}config.local.js`);
  } else {
    // Fall back to production config
    if (fileExists(`${configPath}config.js`)) {
      injectScript(`${configPath}config.js`);
    } else {
      console.warn('No configuration files found, using defaults');
    }
  }
  
  // Log the final configuration after a small delay to account for async script loading
  setTimeout(() => {
    console.log('Final configuration:', window.CONFIG);
  }, 100);
});