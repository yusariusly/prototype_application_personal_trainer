const fs = require('fs');
const path = require('path');

const dirs = ['src/views', 'admin/views', 'src/controllers'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    if (filePath.includes('admin\\views') || filePath.includes('admin/views')) {
        newContent = newContent.replace(/import \{.*?\} from '\.\.\/\.\.\/src\/models\/Store\.js';\r?\n?/g, '');
        
        let newImports = [];
        if (content.match(/import \{.*?\} from '\.\.\/\.\.\/src\/models\/Store\.js';/)) {
            if (content.includes('getClients(') || content.match(/\bgetClients\b/)) newImports.push(`import { getClients } from '../../src/models/ClientModel.js';`);
            if (content.includes('saveState(') || content.match(/\bsaveState\b/)) newImports.push(`import { saveState } from '../../src/models/Store.js';`);
            if (content.includes('getPrograms(') || content.match(/\bgetPrograms\b/)) newImports.push(`import { getPrograms } from '../../src/models/ProgramModel.js';`);
            if (content.includes('getSchedule(') || content.match(/\bgetSchedule\b/)) newImports.push(`import { getSchedule } from '../../src/models/ScheduleModel.js';`);
            if (content.includes('getMessages(') || content.match(/\bgetMessages\b/)) newImports.push(`import { getMessages } from '../../src/models/MessageModel.js';`);
            
            if (newImports.length > 0) {
                newContent = newImports.join('\n') + '\n' + newContent;
            }
        }
    }
    
    if (filePath.includes('src\\views') || filePath.includes('src/views') || filePath.includes('src\\controllers') || filePath.includes('src/controllers')) {
        newContent = newContent.replace(/import \{.*?\} from '\.\.\/models\/Store\.js';\r?\n?/g, '');
        
        let newImports = [];
        if (content.match(/import \{.*?\} from '\.\.\/models\/Store\.js';/)) {
            if (content.includes('getActiveClient(') || content.match(/\bgetActiveClient\b/)) newImports.push(`import { getActiveClient } from '../models/ClientModel.js';`);
            if (content.includes('saveState(') || content.match(/\bsaveState\b/)) newImports.push(`import { saveState } from '../models/Store.js';`);
            if (content.includes('getPrograms(') || content.match(/\bgetPrograms\b/)) newImports.push(`import { getPrograms } from '../models/ProgramModel.js';`);
            if (content.includes('getSchedule(') || content.match(/\bgetSchedule\b/)) newImports.push(`import { getSchedule } from '../models/ScheduleModel.js';`);
            if (content.includes('getMessages(') || content.match(/\bgetMessages\b/)) newImports.push(`import { getMessages } from '../models/MessageModel.js';`);
            
            if (newImports.length > 0) {
                newContent = newImports.join('\n') + '\n' + newContent;
            }
        }
    }

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Fixed', filePath);
    }
}

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        if (file.endsWith('.js')) {
            processFile(path.join(dir, file));
        }
    });
});
