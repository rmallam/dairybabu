import { Project, SyntaxKind, JsxText, StringLiteral, Node } from 'ts-morph';
import fs from 'fs';

const project = new Project();
project.addSourceFileAtPath('src/App.tsx');
const sourceFile = project.getSourceFileOrThrow('src/App.tsx');

let enJson: Record<string, string> = {};
let keyCounter = 1;

function generateKey(text: string) {
    const cleanText = text.trim().replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_').toLowerCase();
    const key = cleanText.substring(0, 20) || 'key';
    let finalKey = key;
    while (enJson[finalKey] && enJson[finalKey] !== text.trim()) {
        finalKey = `${key}_${keyCounter++}`;
    }
    return finalKey;
}

// Ensure useTranslation is imported and initialized
let hasUseTranslationImport = false;
sourceFile.getImportDeclarations().forEach(imp => {
    if (imp.getModuleSpecifierValue() === 'react-i18next') {
        hasUseTranslationImport = true;
    }
});

if (!hasUseTranslationImport) {
    sourceFile.addImportDeclaration({
        namedImports: ['useTranslation'],
        moduleSpecifier: 'react-i18next'
    });
}

const appFunction = sourceFile.getFunction('App');
if (appFunction) {
    let hasUseTranslationHook = false;
    appFunction.getVariableStatements().forEach(stmt => {
        if (stmt.getText().includes('useTranslation')) {
            hasUseTranslationHook = true;
        }
    });

    if (!hasUseTranslationHook) {
        appFunction.insertStatements(0, 'const { t } = useTranslation();');
    }
}

// Find all JSX Text nodes
const jsxTextNodes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxText);
jsxTextNodes.forEach(node => {
    const text = node.getLiteralText();
    if (text.trim().length > 0 && !text.trim().match(/^[{}]+$/)) {
        const key = generateKey(text);
        enJson[key] = text.trim();
        // Check if parent is JsxElement or similar and safely wrap
        const parent = node.getParent();
        if (parent) {
            // Because of formatting, replacing exact JSX text can be tricky if it has newlines.
            // But we can just replace the literal text with an expression
            try {
               node.replaceWithText(`{t('${key}')}`);
            } catch (e) {
               console.log("Failed to replace JSX text:", text);
            }
        }
    }
});

// Find JSX attributes that contain string literals (e.g., placeholder)
const jsxAttributes = sourceFile.getDescendantsOfKind(SyntaxKind.JsxAttribute);
jsxAttributes.forEach(attr => {
    const name = attr.getNameNode().getText();
    if (['placeholder', 'title', 'alt', 'label'].includes(name)) {
        const initializer = attr.getInitializer();
        if (Node.isStringLiteral(initializer)) {
            const text = initializer.getLiteralText();
            if (text.trim().length > 0) {
                const key = generateKey(text);
                enJson[key] = text.trim();
                try {
                   attr.setInitializer(`{t('${key}')}`);
                } catch(e) {
                   console.log("Failed to replace attr:", text);
                }
            }
        }
    }
});

// For alerts and confirms inside handlers
const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
callExpressions.forEach(expr => {
    const exprText = expr.getExpression().getText();
    if (exprText === 'alert' || exprText === 'confirm') {
        const args = expr.getArguments();
        if (args.length > 0 && Node.isStringLiteral(args[0])) {
            const text = args[0].getLiteralText();
            if (text.trim().length > 0) {
                const key = generateKey(text);
                enJson[key] = text.trim();
                try {
                   args[0].replaceWithText(`t('${key}')`);
                } catch(e) {}
            }
        }
    }
});


sourceFile.saveSync();
fs.writeFileSync('src/locales/en.json', JSON.stringify(enJson, null, 2));
console.log('Extraction complete. Found', Object.keys(enJson).length, 'keys.');
