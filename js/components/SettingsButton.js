export class SettingsButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  connectedCallback() {
    this.addEventListener('click', this.handleClick);
  }
  
  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
  }
  
  handleClick = () => {
    // Dispatch custom event to open drawer
    this.dispatchEvent(new CustomEvent('toggle-drawer', {
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: var(--space-4, 16px);
          right: var(--space-4, 16px);
          z-index: 1000;
        }
        
        button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--surface-elev, #f7fafc);
          border: 2px solid var(--border, #cbd5e0);
          color: var(--text, #2d3748);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }
        
        button:hover {
          background: var(--accent, #667eea);
          color: white;
          border-color: var(--accent, #667eea);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
          transform: rotate(45deg);
        }
        
        button:active {
          transform: rotate(45deg) scale(0.95);
        }
        
        svg {
          width: 24px;
          height: 24px;
        }
      </style>
      <button aria-label="Settings">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 12h6m6 0h6m-13.22 4.22l4.24 4.24M6.34 6.34l4.24 4.24m4.88 0l4.24 4.24"></path>
        </svg>
      </button>
    `;
  }
}

customElements.define('settings-button', SettingsButton);