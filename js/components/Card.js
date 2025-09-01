export class Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['label', 'width', 'height', 'bg-color', 'text-color', 'draggable'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    const isDraggable = this.getAttribute('draggable') === 'true';
    if (isDraggable) {
      this.draggable = true;
      this.addEventListener('dragstart', this.handleDragStart);
      this.addEventListener('dragend', this.handleDragEnd);
    }
  }
  
  disconnectedCallback() {
    this.removeEventListener('dragstart', this.handleDragStart);
    this.removeEventListener('dragend', this.handleDragEnd);
  }
  
  handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.outerHTML);
    this.style.opacity = '0.4';
  }
  
  handleDragEnd = () => {
    this.style.opacity = '1';
  }
  
  render() {
    const label = this.getAttribute('label') || '';
    const width = this.getAttribute('width') || '64px';
    const height = this.getAttribute('height') || '110px';
    const bgColor = this.getAttribute('bg-color') || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const textColor = this.getAttribute('text-color') || 'white';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: ${width};
          height: ${height};
          background: ${bgColor};
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          cursor: ${this.getAttribute('draggable') === 'true' ? 'move' : 'pointer'};
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        :host(:hover) {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }
        
        :host([draggable="true"]) {
          cursor: move;
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
        }
      </style>
      <div class="card-content">
        <slot>${label}</slot>
      </div>
    `;
  }
}

customElements.define('card-element', Card);