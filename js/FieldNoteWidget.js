import UIComponent from './UIComponent.js';

export default class FieldNoteWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Полевая заметка', label: 'Упражнение на внимание', tone: 'ink' });
    this.index = 0;
    this.notes = [
      ['Найдите самый тихий звук вокруг.', 'Слух'],
      ['Запишите три цвета сегодняшнего города.', 'Цвет'],
      ['Спросите местного жителя о любимом месте без вывески.', 'Разговор'],
      ['Сверните с привычного маршрута на одну улицу.', 'Маршрут'],
      ['Опишите вкус дня пятью словами.', 'Вкус'],
    ];
  }

  render() {
    const element = super.render();
    const body = this.getBody();
    const card = document.createElement('blockquote');
    card.className = 'field-note-card';
    this.note = document.createElement('p');
    this.category = document.createElement('cite');
    card.append(this.note, this.category);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'link-button';
    button.textContent = 'Другая заметка ↗';
    body.append(card, button);
    this.listen(button, 'click', () => this.showNext());
    this.showNote();
    return element;
  }

  showNext() {
    this.index = (this.index + 1 + Math.floor(Math.random() * (this.notes.length - 1))) % this.notes.length;
    this.showNote();
  }

  showNote() {
    const [text, category] = this.notes[this.index];
    this.note.textContent = text;
    this.category.textContent = `Практика: ${category}`;
  }
}
