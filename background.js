// Define la expresión regular una sola vez para reutilizarla.
const YOUTUBE_WATCH_REGEX = /^https:\/\/www\.youtube\.com\/watch\?v=[^&]+(&.*)?$/;

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

async function handleExtensionClick() {
  try {
    const currentTab = await getCurrentTab();

    if (currentTab && currentTab.url) {
      const url = currentTab.url;

      if (YOUTUBE_WATCH_REGEX.test(url)) {
        // Reemplazar el dominio para crear la URL modificada
        const modifiedUrl = url.replace("www.youtube.com", "www.yout-ube.com");

        await browser.tabs.create({ url: modifiedUrl });

        // La extensión ya ha hecho su trabajo, se deshabilita para la pestaña actual.
        await browser.action.disable(currentTab.id);
      } else {
        // Inject the content script only when needed
        await browser.scripting.executeScript({
          target: { tabId: currentTab.id },
          files: [
            "browser-polyfill.min.js",
            "content.js"
          ],
        });

        await browser.action.disable(currentTab.id);
        browser.tabs.sendMessage(currentTab.id, {
          command: "invalidURL",
          message: browser.i18n.getMessage("invalidUrlMessage")
        });
      }
    }
  } catch (error) {
    console.error(`Error during extension click: ${error}`);
  }
}

// Al hacer clic en la extensión
browser.action.onClicked.addListener(handleExtensionClick);

function updateActionState(tabId, url) {
  try {
    if (url && YOUTUBE_WATCH_REGEX.test(url)) {
      browser.action.enable(tabId);
    } else {
      browser.action.disable(tabId);
    }
  } catch (error) {
    console.error(`Error updating action state: ${error}`);
  }
}

// Al cambiar a una pestaña existente
browser.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await browser.tabs.get(activeInfo.tabId);
    updateActionState(tab.id, tab.url);
  } catch (error) {
    console.error(`Error in onActivated listener: ${error}`);
  }
});

// Al actualizar la URL de una pestaña (navegación)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  try {
    if (changeInfo.url) {
      updateActionState(tabId, changeInfo.url);
    }
  } catch (error) {
    console.error(`Error in onUpdated listener: ${error}`);
  }
});
