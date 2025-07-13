(() => {
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  const ICON_CLASS = 'yna-icon-link';
  let isEnabled = true; // Asumimos que está habilitado por defecto
  let debounceTimer;

  // Función para insertar los iconos en la página
  function insertIcons() {
    // Si la funcionalidad no está habilitada, no hacemos nada.
    if (!isEnabled) return;

    // Selecciona solo los enlaces que apuntan a un vídeo de YouTube.
    document.querySelectorAll('a[href*="/watch?v="]').forEach(link => {
      // Evita añadir un icono a un enlace que ya es un icono nuestro
      // o si ya tiene un icono justo después.
      if (link.classList.contains(ICON_CLASS) || link.nextElementSibling?.classList.contains(ICON_CLASS)) {
        return;
      }

      const iconLink = document.createElement('a');
      iconLink.className = ICON_CLASS;

      // Construye la nueva URL modificando la del enlace original.
      const modifiedUrl = link.href.replace('www.youtube.com', 'www.yout-ube.com');
      iconLink.href = modifiedUrl;

      // Haz que el enlace se abra en una nueva pestaña.
      iconLink.target = '_blank';
      iconLink.rel = 'noopener noreferrer'; // Buena práctica de seguridad para target="_blank"
      iconLink.title = "Abrir en yout-ube.com";

      const iconImage = document.createElement('img');
      iconImage.src = browser.runtime.getURL('assets/yna_16.png');
      iconImage.className = 'yna-icon-image';

      iconLink.appendChild(iconImage);
      
      // Inserta el icono justo después del enlace original
      link.insertAdjacentElement('afterend', iconLink);
    });
  }

  // Función para eliminar todos los iconos de la página
  function removeIcons() {
    document.querySelectorAll(`.${ICON_CLASS}`).forEach(icon => icon.remove());
  }

  // Observador para detectar cambios en la página (contenido cargado dinámicamente)
  const observer = new MutationObserver(() => {
    // Usamos un debounce para no ejecutar la función constantemente mientras la página cambia.
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(insertIcons, 500);
  });

  // Escucha los mensajes enviados desde el popup (cuando se pulsa el interruptor)
  browser.runtime.onMessage.addListener((message) => {
    if (message.command === 'toggleState') {
      isEnabled = message.enabled;
      if (isEnabled) {
        insertIcons();
        // Si se habilita, empezamos a observar cambios en el DOM.
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        removeIcons();
        // Si se deshabilita, dejamos de observar para ahorrar recursos.
        observer.disconnect();
      }
    }
  });

  // Al cargar la página, comprueba el estado inicial y actúa en consecuencia
  browser.storage.sync.get('isEnabled').then((result) => {
    isEnabled = result.isEnabled ?? true;
    if (isEnabled) {
      insertIcons();
      // Si está habilitado de inicio, empezamos a observar.
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });
})();