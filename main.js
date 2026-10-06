import Dashboard from './js/Dashboard.js';

const dashboard = new Dashboard({
  container: document.querySelector('#widget-grid'),
  emptyState: document.querySelector('#empty-state'),
  counter: document.querySelector('#widget-count'),
  announcer: document.querySelector('#announcer'),
});

const pageController = new AbortController();

document.querySelectorAll('[data-add-widget]').forEach((button) => {
  button.addEventListener(
    'click',
    () => dashboard.addWidget(button.dataset.addWidget),
    { signal: pageController.signal },
  );
});

['country', 'holidays', 'packing', 'field-note'].forEach((type) => {
  dashboard.addWidget(type, { announce: false });
});

window.addEventListener('pagehide', () => {
  pageController.abort();
  dashboard.destroy();
}, { once: true });
