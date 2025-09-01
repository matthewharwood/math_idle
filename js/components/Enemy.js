/**
 * Enemy WebComponent
 * Displays current enemy based on player level with health bar and image
 */

import { enemies } from '../data/enemies-generated.js';

export class Enemy extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentEnemy = null;
    this.currentHealth = 0;
    this.justDefeated = false;
  }

  connectedCallback() {
    this.render();
    this.loadEnemyState();
  }

  /**
   * Get enemy by level from generated data
   */
  getEnemyByLevel(level) {
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

  /**
   * Load enemy state for current level
   */
  async loadEnemyState() {
    const level = parseInt(this.getAttribute('level') || '1');
    const enemy = this.getEnemyByLevel(level);
    
    if (!enemy) {
      console.error(`No enemy found for level ${level}`);
      return;
    }

    // Check if this is a new enemy or continuing previous battle
    if (!this.currentEnemy || this.currentEnemy.level !== enemy.level) {
      // New enemy - reset to full health
      this.currentEnemy = { ...enemy };
      this.currentHealth = enemy.health;
      console.log(`Loading new enemy: ${enemy.name} (Level ${enemy.level}) with full health`);
    } else {
      // Same enemy - update enemy data but preserve current health
      const preservedHealth = this.currentHealth;
      this.currentEnemy = { ...enemy };
      this.currentHealth = preservedHealth;
      console.log(`Preserving enemy health: ${this.currentEnemy.name} with ${this.currentHealth}/${this.currentEnemy.health} HP`);
    }

    this.updateDisplay();
  }

  /**
   * Deal damage to current enemy with animation
   */
  async takeDamage(damage) {
    if (!this.currentEnemy) return false;

    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, this.currentHealth - damage);
    
    // Show damage number animation
    this.showDamageNumber(damage);
    
    // Animate health bar decrease
    await this.animateHealthChange(oldHealth, this.currentHealth);

    // Check if enemy is defeated
    if (this.currentHealth <= 0) {
      await this.enemyDefeated();
      return true; // Enemy defeated
    }

    return false; // Enemy still alive
  }

  /**
   * Handle enemy defeat
   */
  async enemyDefeated() {
    // Mark as defeated to skip exit animation later
    this.justDefeated = true;
    
    // Play defeat-exit animation (combines defeat effects with exit movement)
    await this.playDefeatExitAnimation();
    
    // Dispatch custom event for enemy defeat
    this.dispatchEvent(new CustomEvent('enemy-defeated', {
      bubbles: true,
      detail: {
        enemy: this.currentEnemy,
        reward: this.currentEnemy.reward,
        enemyLevel: this.currentEnemy.level
      }
    }));
  }

  /**
   * Show damage number animation
   */
  showDamageNumber(damage) {
    const container = this.shadowRoot.querySelector('.enemy-container');
    if (!container) return;

    // Create damage number element
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-number';
    damageEl.textContent = `-${this.formatNumber(damage)}`;
    
    container.appendChild(damageEl);
    
    // Remove after animation
    setTimeout(() => {
      if (damageEl.parentNode) {
        damageEl.parentNode.removeChild(damageEl);
      }
    }, 2000);
  }

  /**
   * Animate health bar change
   */
  async animateHealthChange(oldHealth, newHealth) {
    const healthBar = this.shadowRoot.querySelector('.health-fill');
    const healthText = this.shadowRoot.querySelector('.health-text');
    
    if (!healthBar || !this.currentEnemy) return;
    
    const oldPercentage = (oldHealth / this.currentEnemy.health) * 100;
    const newPercentage = (newHealth / this.currentEnemy.health) * 100;
    
    // Animate the health bar over 500ms
    return new Promise(resolve => {
      const duration = 500;
      const startTime = performance.now();
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        
        const currentPercentage = oldPercentage + (newPercentage - oldPercentage) * easeOutCubic;
        const currentHealth = oldHealth + (newHealth - oldHealth) * easeOutCubic;
        
        healthBar.style.width = `${currentPercentage}%`;
        
        // Update health text
        if (healthText) {
          healthText.textContent = `${this.formatNumber(Math.round(currentHealth))} / ${this.formatNumber(this.currentEnemy.health)}`;
        }
        
        // Change color based on health
        if (currentPercentage > 60) {
          healthBar.style.backgroundColor = 'var(--success)';
        } else if (currentPercentage > 30) {
          healthBar.style.backgroundColor = 'var(--accent)';
        } else {
          healthBar.style.backgroundColor = 'var(--danger)';
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }

  /**
   * Play defeat-exit animation (combines defeat effects with sliding out)
   */
  async playDefeatExitAnimation() {
    const container = this.shadowRoot.querySelector('.enemy-container');
    
    if (container) {
      container.classList.add('defeat-exit');
    }
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (container) {
      container.classList.remove('defeat-exit');
    }
  }

  /**
   * Play enemy enter animation
   */
  async playEnterAnimation() {
    const container = this.shadowRoot.querySelector('.enemy-container');
    if (!container) return;
    
    container.classList.add('entering');
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    container.classList.remove('entering');
  }

  /**
   * Play enemy exit animation
   */
  async playExitAnimation() {
    const container = this.shadowRoot.querySelector('.enemy-container');
    if (!container) return;
    
    container.classList.add('exiting');
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    container.classList.remove('exiting');
  }

  /**
   * Update enemy level (called externally)
   */
  async setLevel(level, animate = false) {
    // Only play exit animation if we have an enemy and it wasn't just defeated
    if (animate && this.currentEnemy && !this.justDefeated) {
      await this.playExitAnimation();
    }
    
    this.setAttribute('level', level);
    await this.loadEnemyState();
    
    if (animate) {
      await this.playEnterAnimation();
      // Clear defeated flag after new enemy enters
      this.justDefeated = false;
    }
  }

  /**
   * Get current enemy health percentage
   */
  getHealthPercentage() {
    if (!this.currentEnemy) return 100;
    return (this.currentHealth / this.currentEnemy.health) * 100;
  }

  /**
   * Update display with current enemy state
   */
  updateDisplay() {
    if (!this.currentEnemy) return;

    const nameEl = this.shadowRoot.querySelector('.enemy-name');
    const levelEl = this.shadowRoot.querySelector('.enemy-level');
    const imageEl = this.shadowRoot.querySelector('.enemy-image');
    const healthBarEl = this.shadowRoot.querySelector('.health-fill');
    const healthTextEl = this.shadowRoot.querySelector('.health-text');

    if (nameEl) nameEl.textContent = this.currentEnemy.name;
    if (levelEl) levelEl.textContent = `Level ${this.currentEnemy.level}`;
    if (imageEl) imageEl.src = this.currentEnemy.imgsrc;
    
    if (healthBarEl) {
      const percentage = this.getHealthPercentage();
      healthBarEl.style.width = `${percentage}%`;
      
      // Change color based on health
      if (percentage > 60) {
        healthBarEl.style.backgroundColor = 'var(--success)';
      } else if (percentage > 30) {
        healthBarEl.style.backgroundColor = 'var(--accent)';
      } else {
        healthBarEl.style.backgroundColor = 'var(--danger)';
      }
    }

    if (healthTextEl) {
      healthTextEl.textContent = `${this.formatNumber(this.currentHealth)} / ${this.formatNumber(this.currentEnemy.health)}`;
    }
  }

  /**
   * Format large numbers for display
   */
  formatNumber(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
    if (num < 1000000000000) return (num / 1000000000).toFixed(1) + 'B';
    return num.toExponential(2);
  }

  /**
   * Get current enemy state for persistence
   */
  getState() {
    return {
      enemy: this.currentEnemy,
      currentHealth: this.currentHealth
    };
  }

  /**
   * Restore enemy state from persistence
   */
  setState(state) {
    if (state && state.enemy) {
      // Deep copy the enemy data to ensure we have all properties
      this.currentEnemy = { ...state.enemy };
      this.currentHealth = state.currentHealth;
      
      // Set the level attribute to match the enemy's level
      this.setAttribute('level', this.currentEnemy.level);
      
      this.updateDisplay();
      console.log(`Enemy state restored: ${this.currentEnemy.name} (Level ${this.currentEnemy.level}) with ${this.currentHealth}/${this.currentEnemy.health} HP`);
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --enemy-width: 300px;
          --enemy-height: 400px;
        }

        .enemy-container {
          width: var(--enemy-width);
          background: var(--surface-elev);
          border: 2px solid var(--border);
          border-radius: 16px;
          padding: var(--space-4);
          box-shadow: var(--shadow);
          text-align: center;
          font-family: var(--font-sans);
        }

        .enemy-header {
          margin-bottom: var(--space-4);
        }

        .enemy-name {
          font-size: 24px;
          font-weight: 700;
          color: var(--text);
          margin: 0 0 var(--space-2) 0;
          font-family: var(--font-display);
        }

        .enemy-level {
          font-size: 16px;
          color: var(--text-muted);
          margin: 0;
          font-family: var(--font-mono);
        }

        .enemy-image-container {
          width: 200px;
          height: 200px;
          margin: 0 auto var(--space-4);
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid var(--border);
          background: var(--surface);
        }

        .enemy-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.3s ease;
        }

        .enemy-image.defeated {
          filter: grayscale(100%) brightness(0.5);
          transform: scale(0.9);
        }

        .health-bar-container {
          margin-bottom: var(--space-3);
        }

        .health-bar-label {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: var(--space-2);
          display: block;
        }

        .health-bar {
          width: 100%;
          height: 12px;
          background: var(--surface);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid var(--border);
        }

        .health-fill {
          height: 100%;
          background: var(--success);
          transition: width 0.5s ease, background-color 0.3s ease;
          border-radius: 6px;
        }

        .health-text {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: var(--space-2);
          font-family: var(--font-mono);
        }

        /* Responsive */
        @media (max-width: 768px) {
          :host {
            --enemy-width: 280px;
            --enemy-height: 360px;
          }

          .enemy-image-container {
            width: 160px;
            height: 160px;
          }

          .enemy-name {
            font-size: 20px;
          }
        }

        /* Damage Numbers */
        .damage-number {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: var(--danger);
          font-size: 32px;
          font-weight: 700;
          font-family: var(--font-mono);
          pointer-events: none;
          z-index: 1000;
          animation: damageFloat 2s ease-out forwards;
        }

        @keyframes damageFloat {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -100%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -150%) scale(0.8);
          }
        }

        /* Animations */
        .enemy-container {
          animation: fadeIn 0.5s ease;
        }

        .enemy-container.entering {
          animation: enemyEnter 0.5s ease-out;
        }

        .enemy-container.exiting {
          animation: enemyExit 0.5s ease-in;
        }

        .enemy-container.defeat-exit {
          animation: defeatExit 0.8s ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes enemyEnter {
          0% {
            opacity: 0;
            transform: translateX(-100%) rotate(-10deg) scale(0.8);
          }
          50% {
            transform: translateX(10px) rotate(5deg) scale(1.1);
          }
          100% {
            opacity: 1;
            transform: translateX(0) rotate(0deg) scale(1);
          }
        }

        @keyframes enemyExit {
          0% {
            opacity: 1;
            transform: translateX(0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateX(100%) rotate(10deg) scale(0.8);
          }
        }

        @keyframes defeatExit {
          0% {
            opacity: 1;
            transform: translateX(0) rotate(0deg) scale(1);
            filter: brightness(1) contrast(1) grayscale(0);
          }
          25% {
            transform: translateX(10px) rotate(-8deg) scale(1.1);
            filter: brightness(1.5) contrast(1.2) grayscale(0);
          }
          50% {
            transform: translateX(30px) rotate(15deg) scale(0.95);
            filter: brightness(0.8) contrast(1.5) grayscale(30%);
          }
          75% {
            transform: translateX(70px) rotate(-5deg) scale(0.85);
            filter: brightness(0.5) contrast(2) grayscale(70%);
          }
          100% {
            opacity: 0;
            transform: translateX(120%) rotate(20deg) scale(0.7);
            filter: brightness(0.3) contrast(2) grayscale(100%);
          }
        }

        .health-fill {
          position: relative;
          overflow: hidden;
          transition: width 0.1s ease, background-color 0.3s ease;
        }

        .health-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      </style>

      <div class="enemy-container">
        <div class="enemy-header">
          <h2 class="enemy-name">Loading...</h2>
          <p class="enemy-level">Level 1</p>
        </div>

        <div class="enemy-image-container">
          <img class="enemy-image" src="" alt="Enemy" />
        </div>

        <div class="health-bar-container">
          <span class="health-bar-label">Health</span>
          <div class="health-bar">
            <div class="health-fill"></div>
          </div>
          <div class="health-text">0 / 0</div>
        </div>
      </div>
    `;
  }
}

// Register the custom element
if (!customElements.get('game-enemy')) {
  customElements.define('game-enemy', Enemy);
}