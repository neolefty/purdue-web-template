#!/usr/bin/env node

/**
 * JSX Structure Validator
 * Checks for common JSX errors before commits
 */

const fs = require('fs');
const path = require('path');

const errors = [];

function validateJSXFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const stack = [];
  const selfClosingTags = ['input', 'img', 'br', 'hr', 'meta', 'link'];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Find opening tags (not self-closing)
    const openingTags = line.match(/<([a-z][a-zA-Z0-9]*)[^>]*(?<!\/)\s*>/g);
    if (openingTags) {
      openingTags.forEach(tag => {
        const tagName = tag.match(/<([a-z][a-zA-Z0-9]*)/)[1];
        if (!selfClosingTags.includes(tagName)) {
          stack.push({ tag: tagName, line: lineNum });
        }
      });
    }
    
    // Find closing tags
    const closingTags = line.match(/<\/([a-z][a-zA-Z0-9]*)>/g);
    if (closingTags) {
      closingTags.forEach(tag => {
        const tagName = tag.match(/<\/([a-z][a-zA-Z0-9]*)/)[1];
        const last = stack.pop();
        
        if (!last) {
          errors.push({
            file: filePath,
            line: lineNum,
            message: `Closing tag </${tagName}> without matching opening tag`
          });
        } else if (last.tag !== tagName) {
          errors.push({
            file: filePath,
            line: lineNum,
            message: `Expected closing tag </${last.tag}> (opened at line ${last.line}), found </${tagName}>`
          });
        }
      });
    }
  });
  
  // Check for unclosed tags
  if (stack.length > 0) {
    stack.forEach(item => {
      errors.push({
        file: filePath,
        line: item.line,
        message: `Unclosed tag <${item.tag}>`
      });
    });
  }
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDirectory(fullPath);
      }
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) {
      validateJSXFile(fullPath);
    }
  });
}

// Run validation
console.log('🔍 Validating JSX structure...\n');

const srcDir = path.join(__dirname, '..', 'src');
scanDirectory(srcDir);

if (errors.length > 0) {
  console.error('❌ JSX Structure Errors Found:\n');
  errors.forEach(error => {
    console.error(`  ${error.file}:${error.line}`);
    console.error(`    ${error.message}\n`);
  });
  process.exit(1);
} else {
  console.log('✅ All JSX files valid!\n');
  process.exit(0);
}
