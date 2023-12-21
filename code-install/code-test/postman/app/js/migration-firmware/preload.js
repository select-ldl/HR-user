// @todo Preload script is only used for desktop app. So hardcoded 'desktop'
// Find cause why 'process.env.SDK_PLATFORM' is not initialized
window.SDK_PLATFORM = process.env.SDK_PLATFORM || 'desktop';

document.addEventListener('dragover', (event) => {
  event.preventDefault();
}, false);

document.addEventListener('drop', (event) => {
  event.preventDefault();
}, false);

