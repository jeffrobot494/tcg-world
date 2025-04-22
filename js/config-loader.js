// Initialize default CONFIG in case both config files fail to load
window.CONFIG = {
  API_URL: "https://tcg-world-backend-production.up.railway.app",
  BASE_HTML_PATH: "", // Same directory for HTML files
  BASE_CSS_PATH: "../css/",   // Path to CSS directory 
  BASE_JS_PATH: "../js/"      // Path to JS directory
};

// Function to load a script dynamically
function loadScript(src, onSuccess, onError) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = onSuccess;
  script.onerror = onError;
  document.head.appendChild(script);
}

// Try to load config.local.js first, fall back to config.js if it fails
loadScript('../config.local.js', 
  // onSuccess - local config loaded
  function() {
    console.log('Local configuration loaded');
  }, 
  // onError - fall back to production config
  function() {
    console.log('Local configuration not found, using production configuration');
    loadScript('../config.js', 
      function() {
        console.log('Production configuration loaded');
      },
      function() {
        console.error('Failed to load any configuration file, using defaults');
      }
    );
  }
);