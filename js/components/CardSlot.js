export class CardSlot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }
  
  static get observedAttributes() {
    return ['width', 'height', 'border-color', 'border-style', 'accepts-drop'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    this.setupSlotChangeListener();
    
    if (this.getAttribute('accepts-drop') === 'true') {
      this.addEventListener('dragover', this.handleDragOver);
      this.addEventListener('drop', this.handleDrop);
      this.addEventListener('dragleave', this.handleDragLeave);
    }
  }
  
  disconnectedCallback() {
    this.removeEventListener('dragover', this.handleDragOver);
    this.removeEventListener('drop', this.handleDrop);
    this.removeEventListener('dragleave', this.handleDragLeave);
  }
  
  setupSlotChangeListener() {
    const slot = this.shadowRoot.querySelector('slot');
    if (slot) {
      slot.addEventListener('slotchange', () => {
        const hasCard = slot.assignedElements().length > 0;
        this.classList.toggle('occupied', hasCard);
        this.setAttribute('has-card', hasCard);
      });
    }
  }
  
  handleDragOver = (e) => {
    e.preventDefault();
    this.classList.add('dragover');
  }
  
  handleDrop = (e) => {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const cardHTML = e.dataTransfer.getData('text/html');
    if (cardHTML && !this.hasCard) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cardHTML, 'text/html');
      const card = doc.body.firstChild;
      if (card && card.tagName === 'CARD-ELEMENT') {
        this.appendChild(card.cloneNode(true));
      }
    }
  }
  
  handleDragLeave = () => {
    this.classList.remove('dragover');
  }
  
  get hasCard() {
    return this.children.length > 0;
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
        }
        
        :host(.occupied) {
          border: none;
        }
        
        :host(.dragover) {
          border-color: #667eea;
          background-color: rgba(102, 126, 234, 0.1);
          border-style: solid;
        }
        
        ::slotted(card-element) {
          position: absolute;
          top: 0;
          left: 0;
        }
        
        slot {
          display: block;
          width: 100%;
          height: 100%;
        }
      </style>
      <slot></slot>
    `;
    
    this.setupSlotChangeListener();
  }
}

customElements.define('card-slot', CardSlot);