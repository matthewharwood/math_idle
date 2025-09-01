export class CardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['title', 'gap', 'bg-color', 'padding', 'direction'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    const title = this.getAttribute('title') || '';
    const gap = this.getAttribute('gap') || '16px';
    const bgColor = this.getAttribute('bg-color') || '#f7fafc';
    const padding = this.getAttribute('padding') || '20px';
    const direction = this.getAttribute('direction') || 'row';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: ${padding};
          background-color: ${bgColor};
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .container {
          display: flex;
          gap: ${gap};
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          flex-direction: ${direction};
        }
        
        .title {
          margin: 0 0 16px 0;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
        }
        
        .title:empty {
          display: none;
        }
        
        ::slotted(card-slot) {
          flex-shrink: 0;
        }
      </style>
      ${title ? `<h2 class="title">${title}</h2>` : ''}
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('card-container', CardContainer);