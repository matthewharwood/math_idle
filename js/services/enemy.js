/**
 * Enemy Service
 * Manages all enemy data for the Math Idle Game
 * 
 * File naming convention: {level}_{name}.png
 * - level: 001-999 (three digits, zero-padded)
 * - name: enemy identifier (lowercase, underscores for spaces)
 * Example: 001_duck.png, 002_goblin.png, 010_dragon.png
 */

// Enemy data array - each enemy has name, imgsrc, and level
export const enemies = [
  {
    level: 1,
    name: "Duck",
    imgsrc: "img/enemy/001_duck.png",
    health: 10,
    reward: 5
  },
  // Level 2-10 enemies (to be added)
  {
    level: 2,
    name: "Slime",
    imgsrc: "img/enemy/002_slime.png",
    health: 15,
    reward: 8
  },
  {
    level: 3,
    name: "Goblin",
    imgsrc: "img/enemy/003_goblin.png",
    health: 20,
    reward: 12
  },
  {
    level: 4,
    name: "Wolf",
    imgsrc: "img/enemy/004_wolf.png",
    health: 25,
    reward: 15
  },
  {
    level: 5,
    name: "Skeleton",
    imgsrc: "img/enemy/005_skeleton.png",
    health: 30,
    reward: 20
  },
  {
    level: 6,
    name: "Orc",
    imgsrc: "img/enemy/006_orc.png",
    health: 40,
    reward: 25
  },
  {
    level: 7,
    name: "Spider Queen",
    imgsrc: "img/enemy/007_spider_queen.png",
    health: 50,
    reward: 30
  },
  {
    level: 8,
    name: "Dark Knight",
    imgsrc: "img/enemy/008_dark_knight.png",
    health: 60,
    reward: 35
  },
  {
    level: 9,
    name: "Troll",
    imgsrc: "img/enemy/009_troll.png",
    health: 75,
    reward: 40
  },
  {
    level: 10,
    name: "Baby Dragon",
    imgsrc: "img/enemy/010_baby_dragon.png",
    health: 100,
    reward: 50
  },
  // Level 11-20 enemies
  {
    level: 11,
    name: "Bandit",
    imgsrc: "img/enemy/011_bandit.png",
    health: 120,
    reward: 55
  },
  {
    level: 12,
    name: "Zombie",
    imgsrc: "img/enemy/012_zombie.png",
    health: 140,
    reward: 60
  },
  {
    level: 13,
    name: "Harpy",
    imgsrc: "img/enemy/013_harpy.png",
    health: 160,
    reward: 65
  },
  {
    level: 14,
    name: "Minotaur",
    imgsrc: "img/enemy/014_minotaur.png",
    health: 180,
    reward: 70
  },
  {
    level: 15,
    name: "Elemental",
    imgsrc: "img/enemy/015_elemental.png",
    health: 200,
    reward: 80
  },
  {
    level: 16,
    name: "Vampire",
    imgsrc: "img/enemy/016_vampire.png",
    health: 230,
    reward: 90
  },
  {
    level: 17,
    name: "Werewolf",
    imgsrc: "img/enemy/017_werewolf.png",
    health: 260,
    reward: 100
  },
  {
    level: 18,
    name: "Necromancer",
    imgsrc: "img/enemy/018_necromancer.png",
    health: 290,
    reward: 110
  },
  {
    level: 19,
    name: "Chimera",
    imgsrc: "img/enemy/019_chimera.png",
    health: 320,
    reward: 120
  },
  {
    level: 20,
    name: "Dragon",
    imgsrc: "img/enemy/020_dragon.png",
    health: 400,
    reward: 150
  },
  // Boss enemies every 10 levels
  {
    level: 30,
    name: "Hydra",
    imgsrc: "img/enemy/030_hydra.png",
    health: 600,
    reward: 250
  },
  {
    level: 40,
    name: "Phoenix",
    imgsrc: "img/enemy/040_phoenix.png",
    health: 900,
    reward: 400
  },
  {
    level: 50,
    name: "Kraken",
    imgsrc: "img/enemy/050_kraken.png",
    health: 1500,
    reward: 600
  },
  {
    level: 60,
    name: "Titan",
    imgsrc: "img/enemy/060_titan.png",
    health: 2500,
    reward: 900
  },
  {
    level: 70,
    name: "Leviathan",
    imgsrc: "img/enemy/070_leviathan.png",
    health: 4000,
    reward: 1300
  },
  {
    level: 80,
    name: "Behemoth",
    imgsrc: "img/enemy/080_behemoth.png",
    health: 6000,
    reward: 1800
  },
  {
    level: 90,
    name: "Ancient Dragon",
    imgsrc: "img/enemy/090_ancient_dragon.png",
    health: 9000,
    reward: 2500
  },
  {
    level: 100,
    name: "Demon Lord",
    imgsrc: "img/enemy/100_demon_lord.png",
    health: 15000,
    reward: 5000
  }
];

// Helper function to get enemy by level
export function getEnemyByLevel(level) {
  // First try to find exact match
  let enemy = enemies.find(e => e.level === level);
  
  // If no exact match, find the closest lower level enemy
  if (!enemy) {
    const lowerEnemies = enemies.filter(e => e.level <= level);
    if (lowerEnemies.length > 0) {
      enemy = lowerEnemies[lowerEnemies.length - 1];
    } else {
      // Default to first enemy if level is too low
      enemy = enemies[0];
    }
  }
  
  return enemy;
}

// Helper function to get enemy by name
export function getEnemyByName(name) {
  return enemies.find(e => e.name.toLowerCase() === name.toLowerCase());
}

// Helper function to get enemies in level range
export function getEnemiesInRange(minLevel, maxLevel) {
  return enemies.filter(e => e.level >= minLevel && e.level <= maxLevel);
}

// Helper function to get all boss enemies (every 10 levels)
export function getBossEnemies() {
  return enemies.filter(e => e.level % 10 === 0);
}

// Helper function to generate enemy data from file pattern
// This can be used to auto-generate entries when new images are added
export function generateEnemyFromFilename(filename) {
  // Parse filename like "001_duck.png"
  const match = filename.match(/(\d{3})_(.+)\.png$/);
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const nameRaw = match[2];
  const name = nameRaw
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Calculate health and reward based on level
  const health = Math.floor(10 * Math.pow(1.3, level - 1));
  const reward = Math.floor(5 * Math.pow(1.25, level - 1));
  
  return {
    level,
    name,
    imgsrc: `img/enemy/${filename}`,
    health,
    reward
  };
}

// Function to dynamically load all enemies from a file list
// This would be called with the result of scanning the img/enemy directory
export function loadEnemiesFromFiles(fileList) {
  const dynamicEnemies = [];
  
  for (const filepath of fileList) {
    const filename = filepath.split('/').pop();
    const enemy = generateEnemyFromFilename(filename);
    if (enemy) {
      dynamicEnemies.push(enemy);
    }
  }
  
  // Sort by level
  dynamicEnemies.sort((a, b) => a.level - b.level);
  
  return dynamicEnemies;
}

// Enemy class for advanced features
export class Enemy {
  constructor(data) {
    this.level = data.level;
    this.name = data.name;
    this.imgsrc = data.imgsrc;
    this.health = data.health || this.calculateHealth();
    this.maxHealth = this.health;
    this.reward = data.reward || this.calculateReward();
    this.defeated = false;
  }
  
  calculateHealth() {
    // Default health calculation based on level
    return Math.floor(10 * Math.pow(1.3, this.level - 1));
  }
  
  calculateReward() {
    // Default reward calculation based on level
    return Math.floor(5 * Math.pow(1.25, this.level - 1));
  }
  
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.defeated = true;
    }
    return this.health;
  }
  
  reset() {
    this.health = this.maxHealth;
    this.defeated = false;
  }
  
  getHealthPercentage() {
    return (this.health / this.maxHealth) * 100;
  }
  
  toJSON() {
    return {
      level: this.level,
      name: this.name,
      imgsrc: this.imgsrc,
      health: this.health,
      maxHealth: this.maxHealth,
      reward: this.reward,
      defeated: this.defeated
    };
  }
}

// Export default for convenience
export default {
  enemies,
  getEnemyByLevel,
  getEnemyByName,
  getEnemiesInRange,
  getBossEnemies,
  generateEnemyFromFilename,
  loadEnemiesFromFiles,
  Enemy
};