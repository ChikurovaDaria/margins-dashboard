import UIComponent from './UIComponent.js';

export default class PackingWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Чемодан', label: 'Личный список', tone: 'ochre' });
    this.items = [
      { id: crypto.randomUUID(), text: 'Документы', packed: true },
      { id: crypto.randomUUID(), text: 'Удобная обувь', packed: false },
    ];
  }

  render() {
    const element = super.render();
    const body = this.getBody();
    this.form = document.createElement('form');
    this.form.className = 'inline-form';
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.maxLength = 60;
    this.input.placeholder = 'Что взять с собой?';
    this.input.setAttribute('aria-label', 'Новая вещь');
    const addButton = document.createElement('button');
    addButton.className = 'button';
    addButton.type = 'submit';
    addButton.textContent = 'Добавить';
    this.form.append(this.input, addButton);
    this.list = document.createElement('ul');
    this.list.className = 'packing-list';
    this.summary = document.createElement('p');
    this.summary.className = 'widget-note';
    body.append(this.form, this.list, this.summary);
    this.listen(this.form, 'submit', this.handleSubmit);
    this.listen(this.list, 'change', this.handleToggle);
    this.listen(this.list, 'click', this.handleDelete);
    this.renderItems();
    return element;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const text = this.input.value.trim();
    if (!text) return;
    this.items.push({ id: crypto.randomUUID(), text, packed: false });
    this.input.value = '';
    this.renderItems();
    this.input.focus();
  };

  handleToggle = (event) => {
    const checkbox = event.target.closest('[data-pack-id]');
    if (!checkbox) return;
    const item = this.items.find(({ id }) => id === checkbox.dataset.packId);
    if (item) item.packed = checkbox.checked;
    this.renderItems();
  };

  handleDelete = (event) => {
    const button = event.target.closest('[data-delete-id]');
    if (!button) return;
    this.items = this.items.filter(({ id }) => id !== button.dataset.deleteId);
    this.renderItems();
  };

  renderItems() {
    this.list.replaceChildren();
    if (!this.items.length) {
      const empty = document.createElement('li');
      empty.className = 'list-empty';
      empty.textContent = 'Список пуст — путешествуйте налегке.';
      this.list.append(empty);
    }
    this.items.forEach((item) => {
      const row = document.createElement('li');
      row.className = 'packing-item';
      row.classList.toggle('is-packed', item.packed);
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = item.packed;
      checkbox.dataset.packId = item.id;
      const text = document.createElement('span');
      text.textContent = item.text;
      label.append(checkbox, text);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'list-delete';
      remove.dataset.deleteId = item.id;
      remove.textContent = 'Удалить';
      remove.setAttribute('aria-label', `Удалить: ${item.text}`);
      row.append(label, remove);
      this.list.append(row);
    });
    const ready = this.items.filter(({ packed }) => packed).length;
    this.summary.textContent = `Собрано ${ready} из ${this.items.length}`;
  }
}
