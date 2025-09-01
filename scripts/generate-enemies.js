#!/usr/bin/env node

/**
 * Build script to generate enemy data from image files
 * Scans img/enemy directory and generates js/data/enemies-generated.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateEnemyCode } from '../js/utils/generate-enemies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enemyDir = path.join(__dirname, '..', 'img', 'enemy');
const outputFile = path.join(__dirname, '..', 'js', 'data', 'enemies-generated.js');

// Ensure output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read enemy directory
const files = fs.readdirSync(enemyDir);
console.log(`Found ${files.length} files in img/enemy/`);

// Generate enemy code
const code = generateEnemyCode(files);

// Write to file
fs.writeFileSync(outputFile, code);
console.log(`Generated enemy data in ${outputFile}`);

// Show summary
const enemyCount = (code.match(/level:/g) || []).length;
console.log(`Created ${enemyCount} enemy entries`);