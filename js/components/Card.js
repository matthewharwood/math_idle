export class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['label', 'card-type', 'data-slot-index'];
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
    const cardType = this.getAttribute('card-type') || 'default';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: var(--card-width, 64px);
          height: var(--card-height, 110px);
          background: var(--card-${cardType}, var(--card-default));
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
          cursor: move;
          user-select: none;
          -webkit-user-select: none;
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-radius 0.2s ease;
          position: relative;
        }
        
        /* Responsive sizing */
        @media (max-width: 640px) {
          :host {
            width: var(--card-width-mobile, 80px);
            height: var(--card-height-mobile, 130px);
          }
        }
        
        /* Hover state */
        :host(:hover) {
          box-shadow: var(--shadow);
          transform: translateY(-2px);
        }
        
        /* Active/dragging state */
        :host(:active) {
          box-shadow: var(--shadow-lg);
          transform: scale(1.02);
          border-radius: 12px;
        }
        
        /* Invisible hit area for easier interaction */
        :host::before {
          content: '';
          position: absolute;
          inset: calc(var(--hit-area, 8px) * -1);
          pointer-events: none;
        }
        
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          padding: 12px 8px;
          box-sizing: border-box;
        }
        
        .card-label {
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          margin-bottom: auto;
        }
        
        @media (max-width: 640px) {
          .card-label {
            font-size: 16px;
          }
        }
        
        /* Drag icon at bottom */
        .drag-icon {
          width: 24px;
          height: 24px;
          margin: 0 auto;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        
        :host(:hover) .drag-icon {
          opacity: 1;
        }
        
        .drag-icon svg {
          width: 100%;
          height: 100%;
          fill: white;
        }
        
        /* Shine effect */
        .card-shine {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
          transition: left 0.5s ease;
          pointer-events: none;
        }
        
        :host(:hover) .card-shine {
          left: 100%;
        }
      </style>
      <div class="card-inner">
        <div class="card-shine"></div>
        <div class="card-label">
          <slot>${label}</slot>
        </div>
        <div class="drag-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 10h2v2H7zm0-4h2v2H7zm0 8h2v2H7zm4-4h2v2h-2zm0-4h2v2h-2zm0 8h2v2h-2zm4-4h2v2h-2zm0-4h2v2h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
      </div>
    `;
  }
}

customElements.define('card-element', Card);