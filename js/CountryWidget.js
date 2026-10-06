import UIComponent from './UIComponent.js';

const COUNTRIES = [
  ['PT', 'Португалия'], ['ES', 'Испания'], ['IT', 'Италия'],
  ['FR', 'Франция'], ['DE', 'Германия'], ['JP', 'Япония'],
  ['GR', 'Греция'], ['TR', 'Турция'],
];

export default class CountryWidget extends UIComponent {
  constructor(config) {
    super({ ...config, title: 'Паспорт страны', label: 'World Bank API', tone: 'sage' });
  }

  render() {
    const element = super.render();
    const body = this.getBody();
    this.form = document.createElement('form');
    this.form.className = 'inline-form';
    this.country = document.createElement('select');
    this.country.setAttribute('aria-label', 'Страна для профиля');
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Не выбрано';
    this.country.append(emptyOption);
    COUNTRIES.forEach(([code, name]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = name;
      option.selected = code === 'PT';
      this.country.append(option);
    });
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'button';
    button.textContent = 'Открыть';
    this.form.append(this.country, button);
    this.content = document.createElement('div');
    this.content.className = 'api-content';
    body.append(this.form, this.content);
    this.listen(this.form, 'submit', this.handleSubmit);
    this.loadCountry();
    return element;
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.loadCountry();
  };

  async loadCountry() {
    const signal = this.resetRequest();
    const code = this.country.value;
    if (!code) return this.showStatus('Выберите страну из списка.', 'empty');
    this.showStatus('Ищем страницу в атласе…');
    try {
      const base = `https://api.worldbank.org/v2/country/${code}`;
      const [profileResponse, populationResponse] = await Promise.all([
        fetch(`${base}?format=json`, { signal }),
        fetch(`${base}/indicator/SP.POP.TOTL?format=json&mrv=1`, { signal }),
      ]);
      if (!profileResponse.ok || !populationResponse.ok) throw new Error('World Bank API error');
      const [profileData, populationData] = await Promise.all([
        profileResponse.json(),
        populationResponse.json(),
      ]);
      const profile = profileData?.[1]?.[0];
      const population = populationData?.[1]?.[0];
      if (!profile) return this.showStatus('Для этой страны данных не найдено.', 'empty');
      this.renderCountry(profile, population);
    } catch (error) {
      if (error.name !== 'AbortError') this.showStatus('Атлас временно недоступен. Попробуйте позже.', 'error');
    }
  }

  showStatus(message, type = 'loading') {
    this.content.replaceChildren(this.createStatus(message, type));
  }

  renderCountry(country, population) {
    this.content.replaceChildren();
    const top = document.createElement('div');
    top.className = 'country-heading';
    const flag = document.createElement('span');
    flag.className = 'country-flag';
    flag.setAttribute('aria-hidden', 'true');
    flag.textContent = [...country.iso2Code]
      .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt()))
      .join('');
    const name = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = country.name;
    const codeLabel = document.createElement('span');
    codeLabel.textContent = `Код направления: ${country.iso2Code}`;
    name.append(title, codeLabel);
    top.append(flag, name);

    const facts = document.createElement('dl');
    facts.className = 'fact-grid';
    this.addFact(facts, 'Столица', country.capitalCity || 'Нет данных');
    this.addFact(facts, 'Регион', country.region?.value || 'Нет данных');
    this.addFact(
      facts,
      `Население · ${population?.date ?? '—'}`,
      population?.value ? new Intl.NumberFormat('ru-RU').format(population.value) : 'Нет данных',
    );
    this.addFact(facts, 'Уровень дохода', country.incomeLevel?.value || 'Нет данных');
    this.content.append(top, facts);
  }

  addFact(list, termText, valueText) {
    const group = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = termText;
    const value = document.createElement('dd');
    value.textContent = valueText;
    group.append(term, value);
    list.append(group);
  }
}
