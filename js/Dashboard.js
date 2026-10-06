import CountryWidget from './CountryWidget.js';
import FieldNoteWidget from './FieldNoteWidget.js';
import HolidayWidget from './HolidayWidget.js';
import PackingWidget from './PackingWidget.js';

const WIDGETS = new Map([
  ['packing', PackingWidget],
  ['field-note', FieldNoteWidget],
  ['country', CountryWidget],
  ['holidays', HolidayWidget],
]);

export default class Dashboard {
  constructor({ container, emptyState, counter, announcer }) {
    this.container = container;
    this.emptyState = emptyState;
    this.counter = counter;
    this.announcer = announcer;
    this.widgets = [];
  }

  addWidget(type, { announce = true } = {}) {
    const WidgetClass = WIDGETS.get(type);
    if (!WidgetClass) throw new TypeError(`Неизвестный тип виджета: ${type}`);

    const widget = new WidgetClass({ id: `${type}-${crypto.randomUUID()}` });
    widget.onRemove = (id) => this.removeWidget(id);
    widget.onMove = (id, direction) => this.moveWidget(id, direction);
    this.widgets.push(widget);
    this.container.append(widget.render());
    this.updateInterface();

    if (announce) {
      this.announce(`Добавлен виджет «${widget.title}»`);
      widget.element.focus({ preventScroll: true });
    }
    return widget;
  }

  removeWidget(id) {
    const index = this.widgets.findIndex((widget) => widget.id === id);
    if (index < 0) return;
    const [widget] = this.widgets.splice(index, 1);
    const title = widget.title;
    widget.destroy();
    this.updateInterface();
    this.announce(`Удалён виджет «${title}»`);
  }

  moveWidget(id, direction) {
    const from = this.widgets.findIndex((widget) => widget.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= this.widgets.length) {
      this.announce('Виджет уже находится у края списка');
      return;
    }
    [this.widgets[from], this.widgets[to]] = [this.widgets[to], this.widgets[from]];
    this.widgets.forEach((widget) => this.container.append(widget.element));
    this.widgets[to].element.focus({ preventScroll: true });
    this.announce(`Виджет перемещён на позицию ${to + 1}`);
  }

  updateInterface() {
    const count = this.widgets.length;
    this.counter.textContent = String(count).padStart(2, '0');
    this.emptyState.hidden = count > 0;
    this.container.hidden = count === 0;
  }

  announce(message) {
    this.announcer.textContent = '';
    requestAnimationFrame(() => { this.announcer.textContent = message; });
  }

  destroy() {
    this.widgets.forEach((widget) => widget.destroy());
    this.widgets = [];
    this.updateInterface();
  }
}
