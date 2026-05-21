import './scss/styles.scss';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as bootstrap from 'bootstrap';

document
  .querySelectorAll('[data-bs-toggle="tooltip"]')
  .forEach((el) => new bootstrap.Tooltip(el));

document
  .querySelectorAll('[data-bs-toggle="popover"]')
  .forEach((el) => new bootstrap.Popover(el));
