export class SideDrawer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isOpen = false;
    this.render();
  }
  
  static get observedAttributes() {
    return ['open', 'title'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'open') {
      this.isOpen = newValue !== null;
      this.updateDrawerState();
    } else if (name === 'title' && oldValue !== newValue) {
      this.render();
    }
  }
  
  connectedCallback() {
    // Listen for toggle events
    document.addEventListener('toggle-drawer', this.toggle);
    
    // Set up close button
    this.shadowRoot.querySelector('.close-button')?.addEventListener('click', this.close);
    
    // Set up overlay click
    this.shadowRoot.querySelector('.overlay')?.addEventListener('click', this.close);
  }
  
  disconnectedCallback() {
    document.removeEventListener('toggle-drawer', this.toggle);
    this.shadowRoot.querySelector('.close-button')?.removeEventListener('click', this.close);
    this.shadowRoot.querySelector('.overlay')?.removeEventListener('click', this.close);
  }
  
  toggle = () => {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.setAttribute('open', '');
    } else {
      this.removeAttribute('open');
    }
    this.updateDrawerState();
  }
  
  close = () => {
    this.isOpen = false;
    this.removeAttribute('open');
    this.updateDrawerState();
  }
  
  updateDrawerState() {
    const drawer = this.shadowRoot.querySelector('.drawer');
    const overlay = this.shadowRoot.querySelector('.overlay');
    
    if (this.isOpen) {
      drawer?.classList.add('open');
      overlay?.classList.add('visible');
    } else {
      drawer?.classList.remove('open');
      overlay?.classList.remove('visible');
    }
    
    // Dispatch state change event
    this.dispatchEvent(new CustomEvent('drawer-state-changed', {
      detail: { isOpen: this.isOpen },
      bubbles: true,
      composed: true
    }));
  }
  
  render() {
    const title = this.getAttribute('title') || 'Settings';
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1999;
        }
        
        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          pointer-events: auto;
        }
        
        .overlay.visible {
          opacity: 1;
          visibility: visible;
        }
        
        .drawer {
          position: absolute;
          top: 0;
          right: 0;
          width: 33%;
          min-width: 320px;
          max-width: 480px;
          height: 100vh;
          background: var(--surface-elev, #edf2f7);
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          display: flex;
          flex-direction: column;
          pointer-events: auto;
        }
        
        .drawer.open {
          transform: translateX(0);
        }
        
        .drawer-header {
          padding: var(--space-6, 24px);
          border-bottom: 1px solid var(--border, #cbd5e0);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .drawer-header h2 {
          margin: 0;
          font-size: 28px;
          font-weight: 400;
          color: var(--text, #2d3748);
          font-family: var(--font-display, 'UnifrakturMaguntia', cursive);
        }
        
        .close-button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: transparent;
          border: none;
          color: var(--text-muted, #718096);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background: var(--surface, #f7fafc);
          color: var(--text, #2d3748);
        }
        
        .close-button svg {
          width: 20px;
          height: 20px;
        }
        
        .drawer-content {
          flex: 1;
          padding: var(--space-6, 24px);
          overflow-y: auto;
        }
        
        ::slotted(*) {
          display: block;
          margin-bottom: var(--space-6, 24px);
        }
        
        @media (max-width: 768px) {
          .drawer {
            width: 80%;
            min-width: 280px;
          }
        }
      </style>
      
      <div class="overlay"></div>
      
      <div class="drawer">
        <div class="drawer-header">
          <h2>${title}</h2>
          <button class="close-button" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="drawer-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('side-drawer', SideDrawer);