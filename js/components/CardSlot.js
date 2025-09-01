export class CardSlot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['width', 'height', 'border-color', 'border-style', 'data-x', 'data-y', 'data-index'];
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
    const width = this.getAttribute('width') || '64px';
    const height = this.getAttribute('height') || '110px';
    const borderColor = this.getAttribute('border-color') || '#cbd5e0';
    const borderStyle = this.getAttribute('border-style') || 'dashed';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
          height: ${height};
          border: 2px ${borderStyle} ${borderColor};
          border-radius: 8px;
          position: relative;
          transition: all 0.2s ease;
          pointer-events: none;
        }
        
        :host(.drop-ready) {
          border-color: #667eea;
          background-color: rgba(102, 126, 234, 0.05);
          border-style: solid;
          transform: scale(1.02);
        }
        
        :host(.drop-ready)::before {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid #667eea;
          border-radius: 10px;
          opacity: 0.3;
          animation: pulse 1s ease-in-out infinite;
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
      </style>
    `;
  }
}

customElements.define('card-slot', CardSlot);