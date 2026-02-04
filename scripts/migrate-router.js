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

const files = getAllFiles(path.join(__dirname, '../src/components'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;

    if (content.includes('react-router-dom')) {
        modified = true;

        // Add "use client" if not present
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
            content = '"use client";\n' + content;
        }

        // Replace Imports
        content = content.replace(/import .*from 'react-router-dom';/g, (match) => {
            let mapping = [];
            if (match.includes('Link')) mapping.push(`import Link from 'next/link';`);
            if (match.includes('useNavigate')) mapping.push(`import { useRouter } from 'next/navigation';`);
            if (match.includes('useLocation') || match.includes('NavLink')) mapping.push(`import { usePathname } from 'next/navigation';`);
            return mapping.join('\n');
        });

        // Replace Hooks
        content = content.replace(/const navigate = useNavigate\(\);/g, 'const router = useRouter();');
        content = content.replace(/navigate\(/g, 'router.push(');

        // Replace Link/NavLink props
        content = content.replace(/<Link\s+to=/g, '<Link href=');
        content = content.replace(/<NavLink\s+to=/g, '<Link href='); // Naive NavLink replacement

        // Naive NavLink isActive replacement (this is complex, might need manual check)
        // We will just convert NavLink to Link and let the user/build fail if isActive is used, or try to patch simple cases
        if (content.includes('isActive')) {
            // Checking for common pattern: className={({ isActive }) => ...}
            // This is hard to regex replace perfectly. 
            // We will insert usePathname hook if NavLink was found
            const hookSearch = 'export function';
            if (!content.includes('const pathname = usePathname()') && content.includes('usePathname')) {
                // Try to inject at the start of component... hard to find reliably without AST.
                // For now, we accept that NavLink className function will break and needs manual fix.
                // Or we simple ignore NavLink complex logic and just make it a Link, creating build errors we fix manually.
            }
        }
    }

    if (modified) {
        fs.writeFileSync(file, content);
        console.log(`Migrated ${file}`);
    }
});
