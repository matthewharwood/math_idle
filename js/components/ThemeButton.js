import { getTheme, toggleTheme } from '../services/theme.js';

export class ThemeButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTheme = 'dark';
  }
  
  async connectedCallback() {
    this.currentTheme = await getTheme();
    this.render();
    
    // Set up click handler
    this.shadowRoot.querySelector('button').addEventListener('click', this.handleToggle);
    
    // Listen for theme changes
    window.addEventListener('theme-changed', this.handleThemeChange);
  }
  
  disconnectedCallback() {
    this.shadowRoot.querySelector('button')?.removeEventListener('click', this.handleToggle);
    window.removeEventListener('theme-changed', this.handleThemeChange);
  }
  
  handleToggle = async () => {
    const newTheme = await toggleTheme();
    this.currentTheme = newTheme;
    this.render();
  }
  
  handleThemeChange = (event) => {
    this.currentTheme = event.detail.theme;
    this.render();
  }
  
  render() {
    const isDark = this.currentTheme === 'dark';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }
        
        button {
          width: 100%;
          padding: var(--space-3, 12px) var(--space-4, 16px);
          background: var(--surface, #f7fafc);
          border: 2px solid var(--border, #cbd5e0);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-3, 12px);
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: var(--font-sans, 'Space Grotesk', sans-serif);
          font-size: 16px;
          font-weight: 500;
          color: var(--text, #2d3748);
        }
        
        button:hover {
          background: var(--surface-elev, #edf2f7);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        button:active {
          transform: translateY(0);
        }
        
        .label {
          display: flex;
          align-items: center;
          gap: var(--space-2, 8px);
        }
        
        .toggle-track {
          width: 48px;
          height: 24px;
          background: ${isDark ? 'var(--accent, #667eea)' : 'var(--border, #cbd5e0)'};
          border-radius: 12px;
          position: relative;
          transition: background-color 0.3s ease;
        }
        
        .toggle-thumb {
          position: absolute;
          top: 2px;
          left: ${isDark ? '24px' : '2px'};
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: left 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .icon {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }
      </style>
      <button aria-label="Toggle theme">
        <div class="label">
          ${isDark ? `
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ` : `
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          `}
          <span>${isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div class="toggle-track">
          <div class="toggle-thumb"></div>
        </div>
      </button>
    `;
  }
}

customElements.define('theme-button', ThemeButton);