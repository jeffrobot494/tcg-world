// Set default configuration
window.CONFIG = {
  API_URL: "https://tcg-world-backend-production.up.railway.app",
  BASE_HTML_PATH: "", // Same directory for HTML files
  BASE_CSS_PATH: "../css/",   // Path to CSS directory 
  BASE_JS_PATH: "../js/"      // Path to JS directory
};

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

// Wait until DOM is ready to ensure configs are loaded before other scripts run
document.addEventListener('DOMContentLoaded', function() {
  console.log('Config loader running, current configuration:', window.CONFIG);

  // Function to create and inject a script tag
  function injectScript(src) {
    const script = document.createElement('script');
    
    // Use onload to know when the script has loaded
    script.onload = function() {
      console.log(`Loaded and merged configuration from: ${src}`);
    };
    
    script.src = src;
    document.head.appendChild(script);
  }

  // Check for local config first
  if (fileExists('../config.local.js')) {
    injectScript('../config.local.js');
  } else {
    // Fall back to production config
    if (fileExists('../config.js')) {
      injectScript('../config.js');
    } else {
      console.warn('No configuration files found, using defaults');
    }
  }
});