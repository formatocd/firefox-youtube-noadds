// Se ejecuta una sola vez cuando la extensión se instala por primera vez.
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Establecemos el valor inicial. Por defecto, la funcionalidad estará habilitada.
    browser.storage.sync.set({ isEnabled: true });
  }
});