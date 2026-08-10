import i18next from 'i18next';
import en from './locales/en.json';
import id from './locales/id.json';

const initialLang = localStorage.getItem('lang') || 'en';

i18next.init({
  lng: initialLang,
  debug: false,
  resources: {
    en: { translation: en },
    id: { translation: id }
  }
});

export const t = (key, opts) => i18next.t(key, opts);
export const changeLanguage = (lng) => {
  localStorage.setItem('lang', lng);
  i18next.changeLanguage(lng);
  translateDOM();
};

export const translateDOM = () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const optsAttr = el.getAttribute('data-i18n-opts');
    let opts = undefined;
    if (optsAttr) {
      try { opts = JSON.parse(optsAttr); } catch(e) { opts = undefined; }
    }
    el.innerHTML = i18next.t(key, opts);
  });
};

// expose for debug
window.__i18n = i18next;

export default i18next;
