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
    return ['title', 'gap', 'bg-color', 'padding', 'direction', 'slot-width', 'slot-height', 'sort-order', 'winning'];
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
      
      // Check initial winning condition
      setTimeout(() => {
        this.checkWinningCondition();
      }, 500);
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
        // Cancel any ongoing animations on all cards
        this.querySelectorAll('card-element').forEach(c => {
          c.removeAttribute('drop-success');
          c.removeAttribute('swap-target');
          if (c === card) {
            c.style.animation = 'none';
            // Force a reflow to ensure animation is cancelled
            void c.offsetHeight;
          }
        });
        
        isDragging = true;
        card.style.zIndex = '1000';
        card.style.cursor = 'grabbing';
        card.setAttribute('dragging', '');
        
        // Get current card position relative to container
        const rect = card.getBoundingClientRect();
        const containerRect = this.getBoundingClientRect();
        
        // Store initial card position
        initialX = rect.left - containerRect.left;
        initialY = rect.top - containerRect.top;
        
        // Calculate offset from where user clicked to card's current position
        // This maintains the click point relative to the card
        startX = e.clientX - initialX;
        startY = e.clientY - initialY;
        lastX = e.clientX;
        lastY = e.clientY;
        
        // Enable 3D perspective on container
        this.style.perspective = '1000px';
        this.style.transition = 'none';
        
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
        
        // Calculate container tilt based on mouse position
        const containerRect = this.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        const mouseX = e.clientX - containerRect.left;
        const mouseY = e.clientY - containerRect.top;
        
        // Calculate tilt angles (max 5 degrees)
        const tiltX = ((mouseY - centerY) / centerY) * -5;
        const tiltY = ((mouseX - centerX) / centerX) * 5;
        
        // Apply 3D transform and elevated shadow
        this.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
        this.style.boxShadow = `${tiltY * 2}px ${tiltX * 2}px 30px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15)`;
        
        // Check for snap preview and swap target
        const rect = card.getBoundingClientRect();
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
        
        // Clear previous swap target
        this.querySelectorAll('card-element[swap-target]').forEach(c => {
          c.removeAttribute('swap-target');
        });
        
        // Show snap preview and swap target if close enough
        if (minDistance < 50) {
          card.setAttribute('snap-preview', '');
          
          // Highlight the card that will be swapped
          const targetCardId = this.state[nearestSlot].card;
          if (targetCardId && targetCardId !== card.id) {
            const targetCard = this.querySelector(`#${targetCardId}`);
            if (targetCard) {
              targetCard.setAttribute('swap-target', '');
            }
          }
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
        
        // Ease container back to normal with smooth transition
        this.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
        this.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        
        // Reset perspective after animation
        setTimeout(() => {
          this.style.perspective = '';
          this.style.transition = '';
        }, 500);
        
        // Re-enable animations on card after drag
        card.style.animation = '';
        
        // Clear swap target
        this.querySelectorAll('card-element[swap-target]').forEach(c => {
          c.removeAttribute('swap-target');
        });
        
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
  
  checkWinningCondition() {
    // Get all cards in order
    const cards = this.querySelectorAll('card-element');
    const sortedCards = Array.from(cards).sort((a, b) => {
      const aSlot = parseInt(a.getAttribute('data-slot-index') || 0);
      const bSlot = parseInt(b.getAttribute('data-slot-index') || 0);
      return aSlot - bSlot;
    });
    
    // Get their values
    const values = sortedCards.map(card => {
      const value = parseInt(card.getAttribute('data-value') || card.getAttribute('label') || 0);
      return value;
    });
    
    // Check if in ascending order
    const isAscending = values.every((val, idx) => {
      if (idx === 0) return true;
      return val >= values[idx - 1];
    });
    
    const sortOrder = this.getAttribute('sort-order') || 'ASC';
    const isWinning = (sortOrder === 'ASC' && isAscending) || 
                      (sortOrder === 'DESC' && !isAscending);
    
    if (isWinning && !this.hasAttribute('winning')) {
      // Set winning state
      this.setAttribute('winning', '');
      
      // Trigger staggered fall animation
      sortedCards.forEach((card, index) => {
        setTimeout(() => {
          card.setAttribute('falling', '');
        }, index * 50); // Stagger by 50ms per card
      });
      
      // Dispatch winning event after animations start
      setTimeout(() => {
        this.dispatchEvent(new CustomEvent('containerWon', {
          detail: {
            values: values,
            sortOrder: sortOrder
          },
          bubbles: true
        }));
      }, 100);
      
      // Disable all cards
      sortedCards.forEach(card => {
        card.style.pointerEvents = 'none';
      });
      
      console.log('Container sorted! Values:', values);
    } else if (!isWinning && this.hasAttribute('winning')) {
      // Remove winning state if no longer winning
      this.removeAttribute('winning');
      
      // Re-enable cards
      sortedCards.forEach(card => {
        card.style.pointerEvents = '';
      });
    }
    
    return isWinning;
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
      
      // Animate both cards with bounce
      animate(card, {
        left: this.state[targetSlotIndex].x,
        top: this.state[targetSlotIndex].y,
        duration: 300,
        ease: 'outCubic',
        complete: () => {
          card.setAttribute('drop-success', '');
          setTimeout(() => card.removeAttribute('drop-success'), 400);
        }
      });
      
      animate(otherCard, {
        left: this.state[currentSlotIndex].x,
        top: this.state[currentSlotIndex].y,
        duration: 300,
        ease: 'outCubic',
        complete: () => {
          otherCard.setAttribute('drop-success', '');
          setTimeout(() => otherCard.removeAttribute('drop-success'), 400);
        }
      });
      
      // Update slot indices
      card.setAttribute('data-slot-index', targetSlotIndex);
      otherCard.setAttribute('data-slot-index', currentSlotIndex);
      
      // Dispatch swap event for game state management
      this.dispatchEvent(new CustomEvent('cardSwapped', {
        detail: {
          card1Id: cardId,
          card2Id: targetCard
        },
        bubbles: true
      }));
    } else {
      // Move to empty slot
      this.state[currentSlotIndex].card = null;
      this.state[targetSlotIndex].card = cardId;
      
      animate(card, {
        left: this.state[targetSlotIndex].x,
        top: this.state[targetSlotIndex].y,
        duration: 300,
        ease: 'outCubic',
        complete: () => {
          card.setAttribute('drop-success', '');
          setTimeout(() => card.removeAttribute('drop-success'), 400);
        }
      });
      
      card.setAttribute('data-slot-index', targetSlotIndex);
      
      // Dispatch move event for game state management
      this.dispatchEvent(new CustomEvent('cardMoved', {
        detail: {
          cardId: cardId,
          fromSlot: currentSlotIndex,
          toSlot: targetSlotIndex
        },
        bubbles: true
      }));
    }
    
    // Check for winning condition after any card movement
    setTimeout(() => {
      this.checkWinningCondition();
    }, 400); // Wait for animation to complete
  }
  
  animateNewCards() {
    const cards = this.querySelectorAll('card-element');
    cards.forEach((card, index) => {
      // Remove falling attribute
      card.removeAttribute('falling');
      // Add entering attribute with stagger
      setTimeout(() => {
        card.setAttribute('entering', '');
        // Remove entering attribute after animation
        setTimeout(() => {
          card.removeAttribute('entering');
        }, 320);
      }, index * 50); // Stagger by 50ms per card
    });
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
    
    const sortOrder = this.getAttribute('sort-order') || 'ASC';
    const isWinning = this.hasAttribute('winning');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          padding: ${padding};
          background-color: ${bgColor};
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          transform-style: preserve-3d;
          will-change: transform, box-shadow;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        :host([winning]) {
          background-color: var(--success-surface);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.2), var(--shadow-sm);
        }
        
        :host([winning]) .sort-order-tag {
          background: var(--success);
          color: white;
        }
        
        .container {
          position: relative;
          height: ${slotHeight}px;
          width: ${containerWidth}px;
        }
        
        .title {
          margin: 0 0 var(--space-4, 16px) 0;
          font-family: var(--font-display, 'UnifrakturMaguntia', cursive);
          font-size: 28px;
          font-weight: 400;
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
        
        .sort-order-tag {
          position: absolute;
          top: ${padding};
          right: ${padding};
          background: var(--accent);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-family: var(--font-mono, 'Space Mono', monospace);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          z-index: 100;
          transition: background-color 0.3s ease;
        }
        
        :host([winning]) ::slotted(card-element) {
          pointer-events: none;
          opacity: 0.9;
        }
      </style>
      ${title ? `<h2 class="title">${title}</h2>` : ''}
      <div class="sort-order-tag">${sortOrder}</div>
      <div class="container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('card-container', CardContainer);