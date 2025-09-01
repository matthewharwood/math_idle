/**
 * Utility to generate enemy data from image files
 * Run this to auto-generate enemy entries when new images are added
 * 
 * Usage: This can be integrated into a build script or run manually
 * to scan the img/enemy directory and generate enemy data
 */

import { generateEnemyFromFilename } from '../services/enemy.js';

/**
 * Scans a directory for enemy images and generates enemy data
 * @param {string[]} filenames - Array of filenames in img/enemy directory
 * @returns {string} JavaScript code for enemy array
 */
export function generateEnemyCode(filenames) {
  const enemies = [];
  
  for (const filename of filenames) {
    // Skip non-PNG files
    if (!filename.endsWith('.png')) continue;
    
    const enemy = generateEnemyFromFilename(filename);
    if (enemy) {
      enemies.push(enemy);
    }
  }
  
  // Sort by level
  enemies.sort((a, b) => a.level - b.level);
  
  // Generate JavaScript code
  let code = 'export const enemies = [\n';
  
  for (const enemy of enemies) {
    code += '  {\n';
    code += `    level: ${enemy.level},\n`;
    code += `    name: "${enemy.name}",\n`;
    code += `    imgsrc: "${enemy.imgsrc}",\n`;
    code += `    health: ${enemy.health},\n`;
    code += `    reward: ${enemy.reward}\n`;
    code += '  },\n';
  }
  
  code += '];\n';
  
  return code;
}

/**
 * Example function to demonstrate expected file naming patterns
 */
export function getExampleFilenames() {
  return [
    "001_duck.png",
    "002_slime.png",
    "003_goblin.png",
    "004_wolf.png",
    "005_skeleton.png",
    "010_baby_dragon.png",
    "020_dragon.png",
    "030_hydra.png",
    "050_kraken.png",
    "100_demon_lord.png",
    "150_chaos_emperor.png",
    "200_void_destroyer.png",
    "250_time_reaper.png",
    "300_infinity_guardian.png",
    "500_universe_ender.png",
    "999_math_god.png"
  ];
}

/**
 * Generates a template for missing enemy images
 * @param {number} startLevel 
 * @param {number} endLevel 
 * @returns {string[]} Array of suggested filenames
 */
export function generateMissingEnemyFilenames(startLevel, endLevel) {
  const filenames = [];
  const enemyTypes = [
    'slime', 'goblin', 'wolf', 'skeleton', 'orc', 'spider', 'knight', 
    'troll', 'dragon', 'demon', 'elemental', 'vampire', 'werewolf',
    'necromancer', 'chimera', 'hydra', 'phoenix', 'kraken', 'titan',
    'leviathan', 'behemoth', 'angel', 'devil', 'reaper', 'guardian'
  ];
  
  for (let level = startLevel; level <= endLevel; level++) {
    const paddedLevel = String(level).padStart(3, '0');
    const enemyType = enemyTypes[level % enemyTypes.length];
    
    // Add prefix/suffix for special levels
    let enemyName = enemyType;
    if (level % 100 === 0) {
      enemyName = `ultimate_${enemyType}`;
    } else if (level % 50 === 0) {
      enemyName = `mega_${enemyType}`;
    } else if (level % 10 === 0) {
      enemyName = `boss_${enemyType}`;
    }
    
    filenames.push(`${paddedLevel}_${enemyName}.png`);
  }
  
  return filenames;
}

export default {
  generateEnemyCode,
  getExampleFilenames,
  generateMissingEnemyFilenames
};