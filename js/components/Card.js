export class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 64px;
        height: 110px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      
      :host(:hover) {
        transform: translateY(-2px);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
      
      .card-content {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        font-weight: bold;
      }
    `;
    
    const content = document.createElement('div');
    content.className = 'card-content';
    content.textContent = this.getAttribute('label') || 'Card';
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(content);
  }
  
  static get observedAttributes() {
    return ['label'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'label' && this.shadowRoot) {
      const content = this.shadowRoot.querySelector('.card-content');
      if (content) {
        content.textContent = newValue || 'Card';
      }
    }
  }
}

customElements.define('card-element', Card);