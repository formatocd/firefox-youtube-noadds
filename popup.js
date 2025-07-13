const toggleSwitch = document.getElementById('toggleSwitch');

// Al abrir el popup, carga el estado actual desde el almacenamiento.
document.addEventListener('DOMContentLoaded', async () => {
  // Usamos browser.storage.sync para que la configuración se sincronice entre dispositivos.
  const result = await browser.storage.sync.get('isEnabled');
  // Si no está definido, asumimos que es true (habilitado por defecto).
  toggleSwitch.checked = result.isEnabled ?? true;
});

// Cuando el usuario cambia el interruptor.
toggleSwitch.addEventListener('change', async () => {
  const isEnabled = toggleSwitch.checked;
  
  // Guarda el nuevo estado.
  await browser.storage.sync.set({ isEnabled });

  // Envía un mensaje a todas las pestañas para que actualicen su estado en vivo.
  const tabs = await browser.tabs.query({});
  tabs.forEach(tab => {
    // Usamos un catch por si alguna pestaña no tiene el content script inyectado
    // o es una pestaña protegida a la que no podemos acceder.
    browser.tabs.sendMessage(tab.id, { command: 'toggleState', enabled: isEnabled })
      .catch(error => {
        // Es normal que haya errores en pestañas internas del navegador. Los ignoramos.
      });
  });
});