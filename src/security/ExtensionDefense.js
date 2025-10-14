// Browser Extension Defense Script
// This prevents browser extensions from causing 404 errors in console

// Common extension files that might cause 404s
const extensionFiles = ['utils.js', 'heuristicsRedefinitions.js', 'extensionState.js'];

// Prevent extension script injection errors
window.addEventListener('error', (e) => {
  if (e.filename && extensionFiles.some(file => e.filename.includes(file))) {
    // Silently catch extension-related errors
    e.preventDefault();
    return false;
  }
});

// Extension communication blocker
if (window.chrome && window.chrome.runtime) {
  // Block extension communication to prevent runtime.lastError
  const originalSendMessage = window.chrome.runtime.sendMessage;
  window.chrome.runtime.sendMessage = function() {
    // Silently ignore extension messages
    return Promise.resolve();
  };
}

console.log('🛡️ Extension defense initialized');