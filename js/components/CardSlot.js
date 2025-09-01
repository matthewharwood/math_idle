export class CardSlot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['data-x', 'data-y', 'data-index', 'drop-ready', 'drop-allowed', 'drop-denied'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
      if (name === 'data-x' || name === 'data-y') {
        this.updatePosition();
      }
    }
  }
  
  connectedCallback() {
    this.render();
    this.updatePosition();
  }
  
  updatePosition() {
    const x = this.getAttribute('data-x') || '0';
    const y = this.getAttribute('data-y') || '0';
    this.style.position = 'absolute';
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
  }
  
  render() {
    const isDropReady = this.hasAttribute('drop-ready');
    const isDropAllowed = this.hasAttribute('drop-allowed');
    const isDropDenied = this.hasAttribute('drop-denied');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: var(--card-width, 64px);
          height: var(--card-height, 110px);
          border: 2px dashed var(--border, #cbd5e0);
          border-radius: 8px;
          position: relative;
          transition: all 0.2s ease;
          pointer-events: none;
          background-color: var(--surface);
          box-sizing: border-box;
        }
        
        /* Responsive sizing */
        @media (max-width: 640px) {
          :host {
            width: var(--card-width-mobile, 80px);
            height: var(--card-height-mobile, 130px);
          }
        }
        
        /* Extended hit area for easier dropping */
        :host::after {
          content: "";
          position: absolute;
          inset: calc(var(--hit-area, 8px) * -1);
          pointer-events: auto;
        }
        
        /* Drop ready state with diagonal pattern */
        :host([drop-ready]) {
          border-color: var(--accent, #667eea);
          border-style: solid;
          background-image: var(--pattern-diagonal);
          background-color: var(--accent-surface, rgba(102, 126, 234, 0.05));
          transform: scale(1.02);
        }
        
        :host([drop-ready])::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid var(--accent, #667eea);
          border-radius: 10px;
          opacity: 0.3;
          animation: pulse 1s ease-in-out infinite;
        }
        
        /* Drop allowed state */
        :host([drop-allowed]) {
          border-color: var(--success, #10b981);
          background-color: var(--success-surface, rgba(16, 185, 129, 0.08));
        }
        
        :host([drop-allowed]) .status-icon.success {
          display: block;
        }
        
        /* Drop denied state */
        :host([drop-denied]) {
          border-color: var(--danger, #ef4444);
          background-color: var(--danger-surface, rgba(239, 68, 68, 0.08));
          animation: shake 0.3s ease-out;
        }
        
        :host([drop-denied]) .status-icon.denied {
          display: block;
        }
        
        /* Status icons */
        .status-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 32px;
          height: 32px;
          display: none;
          opacity: 0.6;
        }
        
        .status-icon.success {
          background: var(--success);
          -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>') center/contain no-repeat;
          mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>') center/contain no-repeat;
        }
        
        .status-icon.denied {
          background: var(--danger);
          -webkit-mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>') center/contain no-repeat;
          mask: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>') center/contain no-repeat;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      </style>
      <div class="status-icon success"></div>
      <div class="status-icon denied"></div>
    `;
  }
}

customElements.define('card-slot', CardSlot);