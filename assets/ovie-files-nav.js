/* Files_upd navigation: Home returns to index, Insights opens the Insights list. */
(() => {
  'use strict';
  const routes = { Home: 'index.html', Insights: 'Ovie_Insights_Assets_V3.html' };
  document.addEventListener('click', event => {
    const button = event.target.closest('.mobile-nav button, .sidebar nav button, .sidebar button');
    if (!button || button.getAttribute('aria-current') === 'page') return;
    const target = routes[button.textContent.trim()];
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.href = target;
  }, true);
})();
