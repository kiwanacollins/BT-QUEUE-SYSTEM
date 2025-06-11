#!/usr/bin/env node

// Simple icon generator script
// This creates placeholder icons for the PWA manifest

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create a simple colored square as placeholder
function createPlaceholderIcon(size) {
  // Since we can't easily generate PNGs in Node.js without dependencies,
  // we'll create a simple HTML file that can be used to generate icons
  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { margin: 0; padding: 0; }
        .icon {
            width: ${size}px;
            height: ${size}px;
            background: linear-gradient(135deg, #8B5CF6, #6B46C1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-family: Arial, sans-serif;
            font-weight: bold;
            font-size: ${Math.floor(size * 0.2)}px;
            border-radius: ${Math.floor(size * 0.15)}px;
        }
    </style>
</head>
<body>
    <div class="icon">BT</div>
</body>
</html>`;
}

console.log('Creating placeholder icon files...');

sizes.forEach(size => {
  const html = createPlaceholderIcon(size);
  const filename = `icon-${size}x${size}.html`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, html);
  console.log(`Created ${filename}`);
});

console.log('\\nPlaceholder icon files created!');
console.log('To convert to PNG:');
console.log('1. Open each HTML file in a browser');
console.log('2. Take a screenshot of the icon');
console.log('3. Save as PNG with the corresponding name');
console.log('\\nOr use an online SVG to PNG converter with the icon.svg file');
