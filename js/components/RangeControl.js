export class RangeControl extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.ranges = [10, 50, 100, 500, 1000, 1500, 5000, 10000];
    this.currentIndex = 0;
    this.value = this.ranges[0];
  }
  
  static get observedAttributes() {
    return ['value', 'label'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'value') {
        const val = parseInt(newValue);
        const index = this.ranges.indexOf(val);
        if (index !== -1) {
          this.currentIndex = index;
          this.value = val;
        }
      }
      this.render();
    }
  }
  
  connectedCallback() {
    const initValue = parseInt(this.getAttribute('value')) || 10;
    const index = this.ranges.indexOf(initValue);
    if (index !== -1) {
      this.currentIndex = index;
      this.value = initValue;
    }
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
    if (this.currentIndex < this.ranges.length - 1) {
      this.currentIndex++;
      this.value = this.ranges[this.currentIndex];
      this.setAttribute('value', this.value);
      this.render();
      this.dispatchChangeEvent();
    }
  }
  
  handleDown = () => {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.value = this.ranges[this.currentIndex];
      this.setAttribute('value', this.value);
      this.render();
      this.dispatchChangeEvent();
    }
  }
  
  dispatchChangeEvent() {
    this.dispatchEvent(new CustomEvent('range-changed', {
      detail: { value: this.value },
      bubbles: true,
      composed: true
    }));
  }
  
  formatValue(val) {
    if (val >= 1000) {
      return (val / 1000) + 'k';
    }
    return val.toString();
  }
  
  render() {
    const label = this.getAttribute('label') || 'Range';
    
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
          padding: var(--space-2, 8px) var(--space-3, 12px);
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(10px);
          transition: all 0.2s ease;
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
          font-size: 20px;
          font-weight: 700;
          color: var(--success, #10b981);
          min-width: 50px;
          text-align: center;
          padding: var(--space-1, 4px) var(--space-2, 8px);
          background: var(--surface, #f7fafc);
          border-radius: 6px;
        }
        
        .value-prefix {
          font-size: 14px;
          color: var(--text-muted, #718096);
          margin-right: 2px;
        }
        
        svg {
          width: 16px;
          height: 16px;
        }
      </style>
      
      <div class="control-container">
        <div class="label">${label}</div>
        <div class="controls">
          <button class="btn-up" ${this.currentIndex >= this.ranges.length - 1 ? 'disabled' : ''} aria-label="Increase">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
          <div class="value">
            <span class="value-prefix">0-</span>${this.formatValue(this.value)}
          </div>
          <button class="btn-down" ${this.currentIndex <= 0 ? 'disabled' : ''} aria-label="Decrease">
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

customElements.define('range-control', RangeControl);