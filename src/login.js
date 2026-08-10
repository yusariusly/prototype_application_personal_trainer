import { getClients } from './models/ClientModel.js';
        import { getPrograms } from './models/ProgramModel.js';
        import { saveState } from './models/Store.js';
        import { saveClient } from './models/ClientModel.js';
        import { t, translateDOM } from './i18n.js';
        window.saveClient = saveClient;
        window.getClients = getClients;
        window.getPrograms = getPrograms;
        window.saveState = saveState;
        window.t = t;
        window.translateDOM = translateDOM;
        // translate static elements on this page
        translateDOM();