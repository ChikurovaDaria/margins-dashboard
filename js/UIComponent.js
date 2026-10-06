export default class UIComponent {
  constructor({ id, title, label = 'Путевой инструмент', tone = 'sand' }) {
    if (new.target === UIComponent) throw new TypeError('UIComponent — абстрактный класс');

    this.id = id;
    this.title = title;
    this.label = label;
    this.tone = tone;
    this.element = null;
    this.isMinimized = false;
    this.listeners = [];
    this.abortController = new AbortController();
    this.onRemove = null;
    this.onMove = null;
  }

  render() {
    const article = document.createElement('article');
    article.className = `widget widget--${this.tone}`;
    article.dataset.widgetId = this.id;
    article.tabIndex = -1;

    const header = document.createElement('header');
    header.className = 'widget__header';

    const heading = document.createElement('div');
    const label = document.createElement('p');
    label.className = 'widget__label';
    label.textContent = this.label;
    const title = document.createElement('h3');
    title.id = `${this.id}-title`;
    title.textContent = this.title;
    article.setAttribute('aria-labelledby', title.id);
    heading.append(label, title);

    const actions = document.createElement('div');
    actions.className = 'widget__actions';
    const minimizeButton = this.createActionButton(
      '—',
      'Свернуть виджет',
      () => this.toggleMinimized(),
    );
    minimizeButton.setAttribute('aria-expanded', 'true');
    actions.append(
      this.createActionButton('↑', 'Переместить раньше', () => this.onMove?.(this.id, -1)),
      this.createActionButton('↓', 'Переместить позже', () => this.onMove?.(this.id, 1)),
      minimizeButton,
      this.createActionButton('×', 'Удалить виджет', () => this.onRemove?.(this.id)),
    );

    const body = document.createElement('div');
    body.className = 'widget__body';
    body.dataset.widgetBody = '';
    header.append(heading, actions);
    article.append(header, body);
    this.element = article;
    return article;
  }

  createActionButton(symbol, label, handler) {
    const button = document.createElement('button');
    button.className = 'icon-button';
    button.type = 'button';
    button.textContent = symbol;
    button.setAttribute('aria-label', label);
    this.listen(button, 'click', handler);
    return button;
  }

  listen(target, eventName, handler, options) {
    target.addEventListener(eventName, handler, options);
    this.listeners.push({ target, eventName, handler, options });
  }

  getBody() {
    return this.element?.querySelector('[data-widget-body]') ?? null;
  }

  toggleMinimized() {
    if (!this.element) return;
    this.isMinimized = !this.isMinimized;
    this.element.classList.toggle('widget--minimized', this.isMinimized);
    const button = this.element.querySelector('[aria-label*="вернуть виджет"]');
    if (!button) return;
    button.textContent = this.isMinimized ? '+' : '—';
    button.setAttribute('aria-label', this.isMinimized ? 'Развернуть виджет' : 'Свернуть виджет');
    button.setAttribute('aria-expanded', String(!this.isMinimized));
  }

  createStatus(message, type = 'loading') {
    const status = document.createElement('div');
    status.className = `widget-status widget-status--${type}`;
    status.setAttribute('role', type === 'error' ? 'alert' : 'status');
    status.textContent = message;
    return status;
  }

  resetRequest() {
    this.abortController.abort();
    this.abortController = new AbortController();
    return this.abortController.signal;
  }

  destroy() {
    this.abortController.abort();
    this.listeners.forEach(({ target, eventName, handler, options }) => {
      target.removeEventListener(eventName, handler, options);
    });
    this.listeners = [];
    this.element?.remove();
    this.element = null;
  }
}
