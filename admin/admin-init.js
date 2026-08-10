import { changeLanguage, translateDOM } from '../src/i18n.js';

        // initialize language indicator
        const indicator = document.getElementById('lang-indicator');
        const current = localStorage.getItem('lang') || 'en';
        if (indicator) indicator.innerText = current.toUpperCase();

        window.toggleLanguage = function() {
            const next = (localStorage.getItem('lang') || 'en') === 'en' ? 'id' : 'en';
            changeLanguage(next);
            if (indicator) indicator.innerText = next.toUpperCase();
            translateDOM();
        };

        // translate admin static UI
        translateDOM();