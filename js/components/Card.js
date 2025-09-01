export class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['label', 'width', 'height', 'gradient-type', 'text-color', 'data-slot-index'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    this.render();
    // Ensure card has an ID for state tracking
    if (!this.id) {
      const label = this.getAttribute('label') || 'card';
      const timestamp = Date.now();
      this.id = `${label.toLowerCase().replace(/\s+/g, '-')}-${timestamp}`;
    }
  }
  
  render() {
    const label = this.getAttribute('label') || '';
    const width = this.getAttribute('width') || '64px';
    const height = this.getAttribute('height') || '110px';
    const gradientType = this.getAttribute('gradient-type') || '1';
    const textColor = this.getAttribute('text-color') || 'white';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
          height: ${height};
          background: var(--card-gradient-${gradientType});
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: move;
          user-select: none;
          -webkit-user-select: none;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        
        :host(:active) {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }
        
        .card-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: bold;
          padding: 8px;
          box-sizing: border-box;
          text-align: center;
          pointer-events: none;
        }
        
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease;
        }
        
        :host(:hover) .card-shine {
          left: 100%;
        }
      </style>
      <div class="card-inner">
        <div class="card-shine"></div>
        <div class="card-content">
          <slot>${label}</slot>
        </div>
      </div>
    `;
  }
}

customElements.define('card-element', Card);