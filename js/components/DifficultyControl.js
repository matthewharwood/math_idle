export class DifficultyControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.value = 2;
    this.min = 2;
    this.max = 10;
  }
  
  static get observedAttributes() {
    return ['value', 'min', 'max', 'label'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') this.value = parseInt(newValue) || 2;
      if (name === 'min') this.min = parseInt(newValue) || 2;
      if (name === 'max') this.max = parseInt(newValue) || 10;
      this.render();
    }
  }
  
  connectedCallback() {
    this.value = parseInt(this.getAttribute('value')) || 2;
    this.min = parseInt(this.getAttribute('min')) || 2;
    this.max = parseInt(this.getAttribute('max')) || 10;
    this.render();
    this.setupEventListeners();
  }
  
  disconnectedCallback() {
    this.shadowRoot.querySelector('.btn-up')?.removeEventListener('click', this.handleUp);
    this.shadowRoot.querySelector('.btn-down')?.removeEventListener('click', this.handleDown);
  }
  
  setupEventListeners() {
    this.shadowRoot.querySelector('.btn-up')?.addEventListener('click', this.handleUp);
    this.shadowRoot.querySelector('.btn-down')?.addEventListener('click', this.handleDown);
  }
  
  handleUp = () => {
    if (this.value < this.max) {
      this.value++;
      this.setAttribute('value', this.value);
      this.render();
      this.dispatchChangeEvent();
    }
  }
  
  handleDown = () => {
    if (this.value > this.min) {
      this.value--;
      this.setAttribute('value', this.value);
      this.render();
      this.dispatchChangeEvent();
    } else {
      // Shake and flash red when trying to go below minimum
      this.showError();
    }
  }
  
  showError() {
    const container = this.shadowRoot.querySelector('.control-container');
    container.classList.add('error');
    setTimeout(() => {
      container.classList.remove('error');
    }, 500);
  }
  
  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('difficulty-changed', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    const label = this.getAttribute('label') || 'Cards';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          user-select: none;
        }
        
        .control-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--surface-elev, #fff);
          border: 2px solid var(--border, #cbd5e0);
          border-radius: 12px;
          padding: var(--space-2, 8px);
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }
        
        .control-container.error {
          animation: shake 0.3s ease-out;
          border-color: var(--danger, #ef4444);
          background: var(--danger-light, #fca5a5);
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        
        .label {
          font-family: var(--font-sans, sans-serif);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted, #718096);
          margin-bottom: var(--space-1, 4px);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .controls {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1, 4px);
        }
        
        button {
          width: 32px;
          height: 24px;
          background: var(--surface, #f7fafc);
          border: 1px solid var(--border, #cbd5e0);
          border-radius: 6px;
          color: var(--text, #2d3748);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          padding: 0;
        }
        
        button:hover:not(:disabled) {
          background: var(--accent, #667eea);
          border-color: var(--accent, #667eea);
          color: white;
          transform: scale(1.1);
        }
        
        button:active:not(:disabled) {
          transform: scale(0.95);
        }
        
        button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        
        .value {
          font-family: var(--font-mono, monospace);
          font-size: 24px;
          font-weight: 700;
          color: var(--accent, #667eea);
          min-width: 40px;
          text-align: center;
          padding: var(--space-1, 4px) var(--space-2, 8px);
          background: var(--surface, #f7fafc);
          border-radius: 6px;
        }
        
        svg {
          width: 16px;
          height: 16px;
        }
      </style>
      
      <div class="control-container">
        <div class="label">${label}</div>
        <div class="controls">
          <button class="btn-up" ${this.value >= this.max ? 'disabled' : ''} aria-label="Increase">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <div class="value">${this.value}</div>
          <button class="btn-down" ${this.value <= this.min ? '' : ''} aria-label="Decrease">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    this.setupEventListeners();
  }
}

customElements.define('difficulty-control', DifficultyControl);