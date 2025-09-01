#!/usr/bin/env node

/**
 * Script to rename enemy images with evenly distributed levels 000-999
 * Extracts simple creature names and assigns random but evenly spaced levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enemyDir = path.join(__dirname, '..', 'img', 'enemy');

/**
 * Extract simple creature name from complex filename
 * e.g. "Acolyte_088_CC-BY-SA_Oozejar.png" -> "acolyte"
 */
function extractCreatureName(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.(png|jpg|jpeg)$/i, '');
  
  // Split by underscore and take first part (creature name)
  const parts = nameWithoutExt.split('_');
  let creatureName = parts[0];
  
  // Convert to lowercase and clean up
  creatureName = creatureName.toLowerCase();
  
  // Replace spaces and special chars with underscores
  creatureName = creatureName.replace(/[^a-z0-9]/g, '_');
  
  // Remove multiple underscores
  creatureName = creatureName.replace(/_+/g, '_');
  
  // Remove leading/trailing underscores
  creatureName = creatureName.replace(/^_|_$/g, '');
  
  // If name is too long, truncate to first word
  if (creatureName.includes('_')) {
    creatureName = creatureName.split('_')[0];
  }
  
  return creatureName || 'creature';
}

/**
 * Generate evenly distributed levels from 001-999
 */
function generateDistributedLevels(count) {
  const levels = [];
  const maxLevel = 999;
  const minLevel = 1;
  const range = maxLevel - minLevel;
  
  // Calculate step size for even distribution
  const step = range / (count - 1);
  
  // Generate evenly spaced levels
  for (let i = 0; i < count; i++) {
    const level = Math.round(minLevel + (i * step));
    levels.push(level);
  }
  
  // Shuffle the levels to make them random
  for (let i = levels.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [levels[i], levels[j]] = [levels[j], levels[i]];
  }
  
  return levels;
}

/**
 * Rename all enemy files
 */
function renameEnemyFiles() {
  if (!fs.existsSync(enemyDir)) {
    console.error(`Enemy directory not found: ${enemyDir}`);
    return;
  }
  
  // Get all image files
  const files = fs.readdirSync(enemyDir);
  const imageFiles = files.filter(file => 
    file.toLowerCase().match(/\.(png|jpg|jpeg)$/i)
  );
  
  if (imageFiles.length === 0) {
    console.log('No image files found in enemy directory.');
    return;
  }
  
  console.log(`Found ${imageFiles.length} image files to rename...`);
  
  // Generate distributed levels
  const levels = generateDistributedLevels(imageFiles.length);
  
  // Create rename mappings
  const renameMappings = [];
  imageFiles.forEach((file, index) => {
    const creatureName = extractCreatureName(file);
    const level = String(levels[index]).padStart(3, '0');
    const newName = `${level}_${creatureName}.png`;
    
    renameMappings.push({
      oldPath: path.join(enemyDir, file),
      newPath: path.join(enemyDir, newName),
      oldName: file,
      newName: newName,
      level: levels[index],
      creatureName: creatureName
    });
  });
  
  // Sort by level for display
  renameMappings.sort((a, b) => a.level - b.level);
  
  // Check for name conflicts
  const newNames = renameMappings.map(m => m.newName);
  const duplicates = newNames.filter((name, index) => newNames.indexOf(name) !== index);
  
  if (duplicates.length > 0) {
    console.log('⚠️  Found duplicate names, adding suffixes...');
    const nameCount = {};
    
    renameMappings.forEach(mapping => {
      const baseName = mapping.newName.replace('.png', '');
      
      if (!nameCount[baseName]) {
        nameCount[baseName] = 1;
      } else {
        nameCount[baseName]++;
        const suffix = nameCount[baseName];
        mapping.newName = `${baseName}_${suffix}.png`;
        mapping.newPath = path.join(enemyDir, mapping.newName);
      }
    });
  }
  
  // Perform renames
  let successCount = 0;
  let errorCount = 0;
  
  console.log('\nRenaming files...');
  
  for (const mapping of renameMappings) {
    try {
      fs.renameSync(mapping.oldPath, mapping.newPath);
      console.log(`✓ ${mapping.oldName} → ${mapping.newName}`);
      successCount++;
    } catch (error) {
      console.error(`✗ Failed to rename ${mapping.oldName}: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Successfully renamed: ${successCount} files`);
  console.log(`Errors: ${errorCount} files`);
  console.log(`Level distribution: ${Math.min(...levels)}-${Math.max(...levels)}`);
  console.log('\nYou can now run: npm run generate-enemies');
}

// Main execution
renameEnemyFiles();