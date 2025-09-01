import { CardSlot } from './CardSlot.js';
import { Card } from './Card.js';

export class CardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        padding: 20px;
        background-color: #f7fafc;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
      
      .container {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .title {
        margin: 0 0 16px 0;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 18px;
        font-weight: 600;
        color: #2d3748;
        text-align: center;
      }
    `;
    
    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = this.getAttribute('title') || 'Card Container';
    
    const container = document.createElement('div');
    container.className = 'container';
    
    const slot = document.createElement('slot');
    container.appendChild(slot);
    
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(title);
    this.shadowRoot.appendChild(container);
  }
  
  static get observedAttributes() {
    return ['title', 'slots'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'title' && this.shadowRoot) {
      const title = this.shadowRoot.querySelector('.title');
      if (title) {
        title.textContent = newValue || 'Card Container';
      }
    }
    
    if (name === 'slots' && newValue && !oldValue) {
      this.createSlots(parseInt(newValue, 10));
    }
  }
  
  connectedCallback() {
    const slotsCount = this.getAttribute('slots');
    if (slotsCount && this.children.length === 0) {
      this.createSlots(parseInt(slotsCount, 10));
    }
  }
  
  createSlots(count) {
    for (let i = 0; i < count; i++) {
      const slot = document.createElement('card-slot');
      this.appendChild(slot);
    }
  }
  
  addCardToSlot(card, slotIndex) {
    const slots = this.querySelectorAll('card-slot');
    if (slots[slotIndex]) {
      return slots[slotIndex].addCard(card);
    }
    return false;
  }
  
  createCard(label) {
    const card = document.createElement('card-element');
    card.setAttribute('label', label);
    return card;
  }
  
  fillAllSlots() {
    const slots = this.querySelectorAll('card-slot');
    slots.forEach((slot, index) => {
      if (!slot.hasCard) {
        const card = this.createCard(`Card ${index + 1}`);
        slot.addCard(card);
      }
    });
  }
}

customElements.define('card-container', CardContainer);