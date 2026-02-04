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

    // Fix imports
    if (content.includes('from "react-router-dom"') || content.includes("from 'react-router-dom'")) {
        // Replace { Link } with Link
        content = content.replace(/import\s+{\s*Link\s*}\s+from\s+['"]react-router-dom['"]/g, "import Link from 'next/link'");

        // Remove other react-router-dom imports
        content = content.replace(/import\s+{[^}]*}\s+from\s+['"]react-router-dom['"];?\r?\n?/g, '');

        modified = true;
    }

    // Add Next.js imports if needed
    if (content.includes('usePathname()') && !content.includes("from 'next/navigation'")) {
        // Add after other imports
        const importMatch = content.match(/^(import[^;]+;[\r\n]+)+/m);
        if (importMatch) {
            const lastImportIndex = importMatch[0].lastIndexOf('\n');
            content = content.slice(0, lastImportIndex + 1) +
                "import { usePathname } from 'next/navigation';\n" +
                content.slice(lastImportIndex + 1);
            modified = true;
        }
    }

    if (content.includes('router.push') && !content.includes("from 'next/navigation'") && !content.includes('useRouter')) {
        const importMatch = content.match(/^(import[^;]+;[\r\n]+)+/m);
        if (importMatch) {
            const lastImportIndex = importMatch[0].lastIndexOf('\n');
            content = content.slice(0, lastImportIndex + 1) +
                "import { useRouter } from 'next/navigation';\n" +
                content.slice(lastImportIndex + 1);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Fixed React Router imports in ${file}`);
    }
});

console.log('Done!');
