import '@fontsource-variable/manrope';
import './scss/styles.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';
import CustomSelect from './components/custom-select.js';

const { createApp, ref } = window.Vue;

const app = createApp({
  components: { CustomSelect },
  setup() {
    const singleSimple = ref(null);
    const singleCountry = ref('country-ru');
    const multiCountries = ref(['country-ru', 'country-kz']);
    const accountValue = ref(null);
    const labeledValue = ref(null);

    const simpleOptions = ['Россия', 'Беларусь', 'Казахстан', 'Армения'];

    const countryOptions = [
      { value: 'country-ru', label: 'Россия', icon: 'bi-flag-fill' },
      { value: 'country-by', label: 'Беларусь', icon: 'bi-flag-fill' },
      { value: 'country-kz', label: 'Казахстан', icon: 'bi-flag-fill' },
      { value: 'country-am', label: 'Армения', icon: 'bi-flag-fill' },
      { value: 'country-uz', label: 'Узбекистан', icon: 'bi-flag-fill', disabled: true },
      { value: 'country-ge', label: 'Грузия', icon: 'bi-flag-fill' },
      { value: 'country-tr', label: 'Турция', icon: 'bi-flag-fill' },
    ];

    const accountOptions = [
      { value: 'acc-1', label: 'Главный счёт', description: '40817 ··· 1234 · ₽' },
      { value: 'acc-2', label: 'Карта', description: '5536 ··· 4321 · ₽' },
      { value: 'acc-3', label: 'Депозит', description: '42305 ··· 9988 · ₽', disabled: true },
    ];

    return {
      singleSimple, singleCountry, multiCountries, accountValue, labeledValue,
      simpleOptions, countryOptions, accountOptions,
    };
  },
});

app.mount('#app');

document
  .querySelectorAll('[data-bs-toggle="tooltip"]')
  .forEach((el) => new bootstrap.Tooltip(el));

document
  .querySelectorAll('[data-bs-toggle="popover"]')
  .forEach((el) => new bootstrap.Popover(el));
