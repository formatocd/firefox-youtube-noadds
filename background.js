// Define la expresión regular una sola vez para reutilizarla.
const YOUTUBE_WATCH_REGEX = /^https:\/\/www\.youtube\.com\/watch\?v=[^&]+(&.*)?$/;

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  let [tab] = await browser.tabs.query(queryOptions);
  return tab;
}

async function handleExtensionClick() {
  console.log("Extensión clicada");
  let currentTab = await getCurrentTab();

  if (currentTab && currentTab.url) {
    const url = currentTab.url;

    // Usa la constante definida arriba
    console.log("URL:", url);

    if (YOUTUBE_WATCH_REGEX.test(url)) {
      // Reemplazar el dominio para crear la URL modificada
      let modifiedUrl = url.replace("www.youtube.com", "www.yout-ube.com");

      await browser.tabs.create({ url: modifiedUrl });

      // La extensión ya ha hecho su trabajo, se deshabilita para la pestaña actual.
      await browser.action.disable(currentTab.id);
    } else {
      // Inject the content script only when needed
      await browser.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ["content.js"],
      });

      await browser.action.disable(currentTab.id);
       browser.tabs.sendMessage(currentTab.id, {
        command: "invalidURL",
        message: browser.i18n.getMessage("invalidUrlMessage")
      });    
    }
  } 
}

// Al hacer clic en la extensión
browser.action.onClicked.addListener(handleExtensionClick);

function updateActionState(tabId, url) {
  if (url && YOUTUBE_WATCH_REGEX.test(url)) {
    browser.action.enable(tabId);
  } else {
    browser.action.disable(tabId);
  }
}

// Al cambiar a una pestaña existente
browser.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await browser.tabs.get(activeInfo.tabId);
  updateActionState(tab.id, tab.url);
});

// Al actualizar la URL de una pestaña (navegación)
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Solo nos interesa cuando la URL ha cambiado
  if (changeInfo.url) {
    updateActionState(tabId, changeInfo.url);
  }
});
