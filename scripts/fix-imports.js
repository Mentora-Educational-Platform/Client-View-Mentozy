const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                arrayOfFiles.push(filePath);
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles(path.join(__dirname, '../src'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    // Replace ../../lib/ with @/lib/
    if (content.includes('../lib/') || content.includes('../../lib/')) {
        content = content.replace(/(\.\.\/)+lib\//g, '@/lib/');
        modified = true;
    }

    // Replace ../context/ with @/context/
    if (content.includes('../context/') || content.includes('../../context/')) {
        content = content.replace(/(\.\.\/)+context\//g, '@/context/');
        modified = true;
    }

    // Replace ../components/ with @/components/
    // Be careful not to break local relative imports if they are intended, 
    // but generally moving to absolute path is safer for deep nesting.
    if (content.includes('../../components/')) {
        content = content.replace(/(\.\.\/)+components\//g, '@/components/');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Fixed imports in ${file}`);
    }
});
