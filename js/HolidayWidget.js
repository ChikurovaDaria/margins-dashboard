import UIComponent from './UIComponent.js';

const COUNTRIES = [
  ['PT', 'Португалия'], ['ES', 'Испания'], ['IT', 'Италия'],
  ['FR', 'Франция'], ['DE', 'Германия'], ['JP', 'Япония'],
];

export default class HolidayWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Праздничный календарь', label: 'Nager.Date API', tone: 'coral' });
  }

  render() {
    const element = super.render();
    const body = this.getBody();
    this.form = document.createElement('form');
    this.form.className = 'holiday-form';
    this.country = document.createElement('select');
    this.country.setAttribute('aria-label', 'Страна');
    COUNTRIES.forEach(([code, name]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      this.country.append(option);
    });
    this.year = document.createElement('input');
    this.year.type = 'number';
    this.year.min = '2020';
    this.year.max = '2030';
    this.year.value = String(new Date().getFullYear());
    this.year.setAttribute('aria-label', 'Год');
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'button';
    button.textContent = 'Показать';
    this.form.append(this.country, this.year, button);
    this.content = document.createElement('div');
    this.content.className = 'api-content';
    body.append(this.form, this.content);
    this.listen(this.form, 'submit', this.handleSubmit);
    this.loadHolidays();
    return element;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.loadHolidays();
  };

  async loadHolidays() {
    const signal = this.resetRequest();
    const year = Number(this.year.value);
    if (!Number.isInteger(year) || year < 2020 || year > 2030) return this.showStatus('Выберите год от 2020 до 2030.', 'empty');
    this.showStatus('Листаем календарь…');
    try {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${this.country.value}`, { signal });
      if (!response.ok) throw new Error('Holiday API error');
      const holidays = await response.json();
      if (!Array.isArray(holidays) || !holidays.length) return this.showStatus('На этот год данных нет.', 'empty');
      this.renderHolidays(holidays);
    } catch (error) {
      if (error.name !== 'AbortError') this.showStatus('Календарь не загрузился. Попробуйте позже.', 'error');
    }
  }

  showStatus(message, type = 'loading') {
    this.content.replaceChildren(this.createStatus(message, type));
  }

  renderHolidays(holidays) {
    this.content.replaceChildren();
    const heading = document.createElement('p');
    heading.className = 'widget-note';
    heading.textContent = `Первые 6 из ${holidays.length} государственных праздников`;
    const list = document.createElement('ol');
    list.className = 'holiday-list';
    holidays.slice(0, 6).forEach((holiday) => {
      const item = document.createElement('li');
      const date = document.createElement('time');
      date.dateTime = holiday.date;
      date.textContent = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(`${holiday.date}T12:00:00`));
      const name = document.createElement('span');
      name.textContent = holiday.localName || holiday.name;
      item.append(date, name);
      list.append(item);
    });
    this.content.append(heading, list);
  }
}
