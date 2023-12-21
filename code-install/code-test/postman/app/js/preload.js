// @todo Preload script is only used for desktop app. So hardcoded 'desktop'
// Find cause why 'process.env.SDK_PLATFORM' is not initialized
window.SDK_PLATFORM = process.env.SDK_PLATFORM || 'desktop';

// @todo remove this flag and its usage once the Scratch Pad is stabilized completely
// https://postmanlabs.atlassian.net/browse/CFDTN-873
window.disableScratchpadForSignedIn = false;

document.addEventListener('dragover', (event) => {
  event.preventDefault();
}, false);

document.addEventListener('drop', (event) => {
  event.preventDefault();
}, false);
