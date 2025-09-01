import { CardContainer } from './components/CardContainer.js';
import { CardSlot } from './components/CardSlot.js';
import { Card } from './components/Card.js';

document.addEventListener('DOMContentLoaded', () => {
  // Create a container with 3 slots
  const container = document.createElement('card-container');
  container.setAttribute('title', 'My Card Collection');
  container.setAttribute('slots', '3');
  
  // Append container to body
  document.body.appendChild(container);
  
  // Wait for container to create slots, then add cards
  setTimeout(() => {
    const slots = container.querySelectorAll('card-slot');
    
    // Create and add cards to each slot
    slots.forEach((slot, index) => {
      const card = document.createElement('card-element');
      card.setAttribute('label', `Card ${index + 1}`);
      slot.appendChild(card);
    });
  }, 0);
  
  // Add some basic styling to the body
  const style = document.createElement('style');
  style.textContent = `
    body {
      margin: 0;
      padding: 40px;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    card-container {
      max-width: 600px;
      width: 100%;
    }
  `;
  document.head.appendChild(style);
});