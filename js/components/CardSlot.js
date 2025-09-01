export class CardSlot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 64px;
        height: 110px;
        border: 2px dashed #cbd5e0;
        border-radius: 8px;
        position: relative;
        transition: border-color 0.2s ease;
      }
      
      :host(.occupied) {
        border: none;
      }
      
      :host(.dragover) {
        border-color: #667eea;
        background-color: rgba(102, 126, 234, 0.1);
      }
      
      ::slotted(card-element) {
        position: absolute;
        top: 0;
        left: 0;
      }
    `;
    
    const slot = document.createElement('slot');
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(slot);
    
    this.setupSlotChangeListener();
  }
  
  setupSlotChangeListener() {
    const slot = this.shadowRoot.querySelector('slot');
    slot.addEventListener('slotchange', () => {
      const hasCard = slot.assignedElements().length > 0;
      this.classList.toggle('occupied', hasCard);
    });
  }
  
  connectedCallback() {
    this.addEventListener('dragover', this.handleDragOver);
    this.addEventListener('drop', this.handleDrop);
    this.addEventListener('dragleave', this.handleDragLeave);
  }
  
  disconnectedCallback() {
    this.removeEventListener('dragover', this.handleDragOver);
    this.removeEventListener('drop', this.handleDrop);
    this.removeEventListener('dragleave', this.handleDragLeave);
  }
  
  handleDragOver = (e) => {
    e.preventDefault();
    this.classList.add('dragover');
  }
  
  handleDrop = (e) => {
    e.preventDefault();
    this.classList.remove('dragover');
  }
  
  handleDragLeave = () => {
    this.classList.remove('dragover');
  }
  
  get hasCard() {
    return this.children.length > 0;
  }
  
  addCard(card) {
    if (!this.hasCard && card.tagName === 'CARD-ELEMENT') {
      this.appendChild(card);
      return true;
    }
    return false;
  }
  
  removeCard() {
    const card = this.querySelector('card-element');
    if (card) {
      this.removeChild(card);
      return card;
    }
    return null;
  }
}

customElements.define('card-slot', CardSlot);