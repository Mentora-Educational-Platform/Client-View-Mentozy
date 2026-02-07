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

// List of hooks that require "use client"
const hooks = [
    'useState', 'useEffect', 'useContext', 'useRef', 'useReducer',
    'useMemo', 'useCallback', 'useLayoutEffect', 'useImperativeHandle',
    'useDebugValue', 'useDeferredValue', 'useTransition', 'useId',
    'useSyncExternalStore', 'useInsertionEffect', 'usePathname', 'useRouter', 'useSearchParams'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Check if file uses any hooks
    const usesHooks = hooks.some(hook => content.includes(hook));

    if (usesHooks) {
        // Check if "use client" is already present
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
            content = '"use client";\n' + content;
            fs.writeFileSync(file, content);
            console.log(`Added "use client" to ${file}`);
        }
    }
});
