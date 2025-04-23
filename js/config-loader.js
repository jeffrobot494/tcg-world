// Set default configuration
window.CONFIG = {
  //API_URL: "https://tcg-world-backend-production.up.railway.app",
  API_URL: "http://localhost:3000",
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

// Function to create and inject a script tag
function injectScript(src) {
  const script = document.createElement('script');
  script.src = src;
  
  // Use onload to know when the script has loaded
  script.onload = function() {
    console.log(`Loaded configuration from: ${src}`);
  };
  
  document.head.appendChild(script);
}

// IMMEDIATELY check for local config first, don't wait for DOMContentLoaded
console.log('Config loader initializing, default configuration:', window.CONFIG);

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