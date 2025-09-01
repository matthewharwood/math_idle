import { animate } from 'animejs';

export class CardContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = [];
    this.draggedCard = null;
    this.render();
  }
  
  static get observedAttributes() {
    return ['title', 'gap', 'bg-color', 'padding', 'direction', 'slot-width', 'slot-height'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.render(); // Re-render with correct slot count
      this.initializeState();
      this.setupDragAndDrop();
    });
  }
  
  initializeState() {
    const slots = this.querySelectorAll('card-slot');
    const gap = parseInt(this.getAttribute('gap') || '16');
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const slotWidth = isMobile ? 80 : parseInt(this.getAttribute('slot-width') || '64');
    
    this.state = Array.from(slots).map((slot, index) => {
      const card = slot.querySelector('card-element');
      const x = index * (slotWidth + gap);
      const y = 0;
      
      // Set slot position
      slot.style.position = 'absolute';
      slot.style.left = `${x}px`;
      slot.style.top = `${y}px`;
      slot.setAttribute('data-x', x);
      slot.setAttribute('data-y', y);
      slot.setAttribute('data-index', index);
      
      // Position card if exists
      if (card) {
        // Move card out of slot and position absolutely
        this.appendChild(card);
        card.style.position = 'absolute';
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        card.style.zIndex = '10';
        card.setAttribute('data-slot-index', index);
        card.setAttribute('data-original-x', x);
        card.setAttribute('data-original-y', y);
      }
      
      return {
        slot: `slot-${index}`,
        card: card ? card.id : null,
        x: x,
        y: y
      };
    });
  }
  
  setupDragAndDrop() {
    const cards = this.querySelectorAll('card-element');
    
    cards.forEach(card => {
      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialX = 0;
      let initialY = 0;
      let lastX = 0;
      let lastY = 0;
      let velocityX = 0;
      let velocityY = 0;
      
      const handleMouseDown = (e) => {
        isDragging = true;
        card.style.zIndex = '1000';
        card.style.cursor = 'grabbing';
        card.setAttribute('dragging', '');
        
        // Get current card position
        const rect = card.getBoundingClientRect();
        const containerRect = this.getBoundingClientRect();
        const currentX = rect.left - containerRect.left;
        const currentY = rect.top - containerRect.top;
        
        // Calculate offset from click point to card top-left
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
        lastX = e.clientX;
        lastY = e.clientY;
        
        // Add visual feedback to slots
        this.querySelectorAll('card-slot').forEach(slot => {
          slot.classList.add('drop-ready');
        });
        
        e.preventDefault();
      };
      
      const handleMouseMove = (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - startX;
        const y = e.clientY - startY;
        
        // Calculate velocity for rotation
        velocityX = e.clientX - lastX;
        velocityY = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        
        // Apply rotation based on horizontal velocity
        const rotation = Math.max(-15, Math.min(15, velocityX * 0.5));
        card.style.setProperty('--drag-rotation', `${rotation}deg`);
        
        card.style.left = `${x}px`;
        card.style.top = `${y}px`;
        
        // Check for snap preview
        const rect = card.getBoundingClientRect();
        const containerRect = this.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2 - containerRect.left;
        const cardCenterY = rect.top + rect.height / 2 - containerRect.top;
        
        let nearestSlot = null;
        let minDistance = Infinity;
        
        this.state.forEach((slotState, index) => {
          const slotCenterX = slotState.x + 32;
          const slotCenterY = slotState.y + 55;
          const distance = Math.sqrt(
            Math.pow(cardCenterX - slotCenterX, 2) + 
            Math.pow(cardCenterY - slotCenterY, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestSlot = index;
          }
        });
        
        // Show snap preview if close enough
        if (minDistance < 50) {
          card.setAttribute('snap-preview', '');
        } else {
          card.removeAttribute('snap-preview');
        }
      };
      
      const handleMouseUp = (e) => {
        if (!isDragging) return;
        isDragging = false;
        card.style.cursor = 'move';
        card.style.zIndex = '10';
        card.removeAttribute('dragging');
        card.removeAttribute('snap-preview');
        card.style.removeProperty('--drag-rotation');
        
        // Remove visual feedback
        this.querySelectorAll('card-slot').forEach(slot => {
          slot.classList.remove('drop-ready');
        });
        
        // Find nearest slot
        const rect = card.getBoundingClientRect();
        const containerRect = this.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2 - containerRect.left;
        const cardCenterY = rect.top + rect.height / 2 - containerRect.top;
        
        let nearestSlot = null;
        let minDistance = Infinity;
        
        this.state.forEach((slotState, index) => {
          const slotCenterX = slotState.x + 32; // half of slot width
          const slotCenterY = slotState.y + 55; // half of slot height
          const distance = Math.sqrt(
            Math.pow(cardCenterX - slotCenterX, 2) + 
            Math.pow(cardCenterY - slotCenterY, 2)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestSlot = index;
          }
        });
        
        // Add drop success animation
        card.setAttribute('drop-success', '');
        setTimeout(() => {
          card.removeAttribute('drop-success');
        }, 400);
        
        // Perform swap if needed
        this.handleCardDrop(card, nearestSlot);
      };
      
      // Use pointer events for unified mouse/touch handling
      card.style.touchAction = 'none'; // Prevent browser touch gestures
      
      card.addEventListener('pointerdown', (e) => {
        card.setPointerCapture(e.pointerId); // Capture all pointer events
        handleMouseDown(e);
      });
      
      card.addEventListener('pointermove', (e) => {
        if (isDragging) {
          handleMouseMove(e);
        }
      });
      
      card.addEventListener('pointerup', (e) => {
        if (isDragging) {
          handleMouseUp(e);
          card.releasePointerCapture(e.pointerId);
        }
      });
      
      card.addEventListener('pointercancel', (e) => {
        if (isDragging) {
          handleMouseUp(e);
          card.releasePointerCapture(e.pointerId);
        }
      });
      
      // Fallback for older browsers
      if (!window.PointerEvent) {
        card.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        card.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const touch = e.touches[0];
          handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} });
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
          if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
          }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
          if (isDragging) {
            handleMouseUp(e);
          }
        });
      }
    });
  }
  
  handleCardDrop(card, targetSlotIndex) {
    const cardId = card.id;
    const currentSlotIndex = parseInt(card.getAttribute('data-slot-index'));
    
    if (currentSlotIndex === targetSlotIndex) {
      // Snap back to same position
      animate(card, {
        left: this.state[targetSlotIndex].x,
        top: this.state[targetSlotIndex].y,
        duration: 300,
        ease: 'outCubic'
      });
      return;
    }
    
    // Check if target slot has a card
    const targetCard = this.state[targetSlotIndex].card;
    
    if (targetCard) {
      // Swap cards
      const otherCard = this.querySelector(`#${targetCard}`);
      
      // Update state
      this.state[currentSlotIndex].card = targetCard;
      this.state[targetSlotIndex].card = cardId;
      
      // Animate both cards
      animate(card, {
        left: this.state[targetSlotIndex].x,
        top: this.state[targetSlotIndex].y,
        duration: 300,
        ease: 'outCubic'
      });
      
      animate(otherCard, {
        left: this.state[currentSlotIndex].x,
        top: this.state[currentSlotIndex].y,
        duration: 300,
        ease: 'outCubic'
      });
      
      // Update slot indices
      card.setAttribute('data-slot-index', targetSlotIndex);
      otherCard.setAttribute('data-slot-index', currentSlotIndex);
    } else {
      // Move to empty slot
      this.state[currentSlotIndex].card = null;
      this.state[targetSlotIndex].card = cardId;
      
      animate(card, {
        left: this.state[targetSlotIndex].x,
        top: this.state[targetSlotIndex].y,
        duration: 300,
        ease: 'outCubic'
      });
      
      card.setAttribute('data-slot-index', targetSlotIndex);
    }
  }
  
  render() {
    const title = this.getAttribute('title') || '';
    const gap = parseInt(this.getAttribute('gap') || '16');
    const bgColor = this.getAttribute('bg-color') || 'var(--surface, #f7fafc)';
    const padding = this.getAttribute('padding') || 'var(--space-5, 20px)';
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const slotHeight = isMobile ? 130 : parseInt(this.getAttribute('slot-height') || '110');
    const slotWidth = isMobile ? 80 : parseInt(this.getAttribute('slot-width') || '64');
    
    // Calculate container width based on number of slots
    const numSlots = this.querySelectorAll('card-slot').length || 3;
    const containerWidth = (slotWidth * numSlots) + (gap * (numSlots - 1));
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          padding: ${padding};
          background-color: ${bgColor};
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
        }
        
        .container {
          position: relative;
          height: ${slotHeight}px;
          width: ${containerWidth}px;
        }
        
        .title {
          margin: 0 0 var(--space-4, 16px) 0;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 18px;
          font-weight: 600;
          color: var(--text, #2d3748);
          text-align: center;
        }
        
        .title:empty {
          display: none;
        }
        
        ::slotted(card-slot) {
          position: absolute !important;
        }
        
        ::slotted(card-element) {
          position: absolute !important;
          cursor: move;
          user-select: none;
          -webkit-user-select: none;
        }
        
        ::slotted(card-element:active) {
          cursor: grabbing;
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