export class GameButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  
  static get observedAttributes() {
    return ['label', 'variant', 'full-width'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    this.render();
    this.shadowRoot.querySelector('button').addEventListener('click', this.handleClick);
  }
  
  disconnectedCallback() {
    this.shadowRoot.querySelector('button')?.removeEventListener('click', this.handleClick);
  }
  
  handleClick = (e) => {
    // Dispatch custom event with button action
    const action = this.getAttribute('action') || 'click';
    this.dispatchEvent(new CustomEvent('game-action', {
      detail: { action },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    const label = this.getAttribute('label') || 'Button';
    const variant = this.getAttribute('variant') || 'primary';
    const fullWidth = this.hasAttribute('full-width');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${fullWidth ? 'block' : 'inline-block'};
        }
        
        button {
          width: ${fullWidth ? '100%' : 'auto'};
          padding: var(--space-3, 12px) var(--space-6, 24px);
          background: ${variant === 'primary' ? 'var(--accent, #667eea)' : 'var(--surface, #f7fafc)'};
          color: ${variant === 'primary' ? 'white' : 'var(--text, #2d3748)'};
          border: ${variant === 'primary' ? 'none' : '2px solid var(--border, #cbd5e0)'};
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          font-family: var(--font-sans, 'Space Grotesk', sans-serif);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        }
        
        button:hover {
          background: ${variant === 'primary' ? 'var(--accent-dark, #5a67d8)' : 'var(--surface-elev, #edf2f7)'};
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16);
          transform: translateY(-2px);
        }
        
        button:active {
          transform: translateY(0);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
      </style>
      <button>
        <slot>${label}</slot>
      </button>
    `;
  }
}

customElements.define('game-button', GameButton);