/**
 * StorageSync - Utility to help synchronize authentication state across tabs
 *
 * This adds event listeners to catch storage changes from other tabs,
 * which helps maintain consistent login state across multiple tabs.
 */

// Initialize the storage sync
export const initStorageSync = () => {
  // Add event listener for storage changes from other tabs
  window.addEventListener('storage', (event) => {
    // If token was removed in another tab, trigger logout in this tab too
    if (event.key === 'token' && !event.newValue) {
      window.location.href = '/';
    }

    // If token was added in another tab, refresh this tab to pick up the auth state
    if (
      event.key === 'token' &&
      event.newValue &&
      !localStorage.getItem('token')
    ) {
      window.location.reload();
    }
  });
};

// A utility to ensure clean logout across all tabs
export const logoutAllTabs = () => {
  // Using a broadcast channel API for modern browsers
  if ('BroadcastChannel' in window) {
    const logoutChannel = new BroadcastChannel('auth_logout');
    logoutChannel.postMessage('logout');
  }

  // Clear localStorage items
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('tokenTimestamp');
};

// Listen for logout broadcasts
export const listenForLogout = () => {
  if ('BroadcastChannel' in window) {
    const logoutChannel = new BroadcastChannel('auth_logout');
    logoutChannel.addEventListener('message', (event) => {
      if (event.data === 'logout') {
        // Clear localStorage without triggering a new broadcast
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('tokenTimestamp');
        window.location.href = '/';
      }
    });
  }
};
