import { changeLanguage, translateDOM } from '../src/i18n.js';

window.changeLanguage = changeLanguage;

// translate admin static UI
translateDOM();