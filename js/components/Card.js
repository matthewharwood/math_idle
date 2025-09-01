export class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['label', 'card-type', 'data-slot-index', 'dragging', 'snap-preview', 'drop-success', 'swap-target', 'falling', 'entering'];
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
        
        /* Hover state - 5deg rotation */
        :host(:hover) {
          box-shadow: var(--shadow);
          transform: translateY(-2px) rotate(5deg);
        }
        
        /* Active/press state - maintains rotation with scale */
        :host(:active) {
          box-shadow: var(--shadow-lg);
          transform: scale(0.98) rotate(5deg);
          border-radius: 12px;
        }
        
        /* Dragging state - floating with rotation */
        :host([dragging]) {
          box-shadow: var(--shadow-xl), 0 0 0 2px var(--accent);
          transform: scale(1.08) rotate(var(--drag-rotation, 0deg)) translateY(-5px);
          outline: 2px dashed var(--accent);
          outline-offset: -2px;
          opacity: 0.9;
          filter: saturate(1.2);
          transition: none;
          z-index: 1000 !important;
        }
        
        /* Snap preview - magnetic guidance without rotation */
        :host([snap-preview]) {
          transform: scale(1.02);
          box-shadow: var(--shadow), 0 0 0 2px var(--success);
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out;
        }
        
        /* Swap target preview - shows which card will be swapped */
        :host([swap-target]) {
          animation: swapPulse 0.5s ease-in-out infinite;
          box-shadow: var(--shadow-lg), 0 0 0 3px var(--accent-light);
        }
        
        @keyframes swapPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
        
        /* Drop success - bounce animation */
        :host([drop-success]) {
          animation: dropBounce 0.4s ease-out;
        }
        
        /* Falling animation for sorted state */
        :host([falling]) {
          animation: fallOff 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          pointer-events: none;
        }
        
        /* Entering animation for new cards */
        :host([entering]) {
          animation: scaleIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes dropBounce {
          0% {
            transform: scale(1.05) translateY(-10px);
          }
          40% {
            transform: scale(0.95) translateY(0);
          }
          60% {
            transform: scale(1.02) translateY(-5px);
          }
          80% {
            transform: scale(0.98) translateY(0);
          }
          100% {
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes fallOff {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(300px) rotate(15deg) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
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
        
        /* Remove shine effect for flat design */
        .card-shine {
          display: none;
        }
      </style>
      <div class="card-inner">
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