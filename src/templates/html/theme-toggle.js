/**
 * Vanilla JavaScript theme toggle functionality
 * Add this script to your HTML and call createThemeToggle() to initialize
 */

class ThemeToggle {
  constructor(options = {}) {
    this.theme = 'light';
    this.options = {
      selector: '[data-theme-toggle]',
      size: 'md',
      variant: 'button',
      className: '',
      ...options
    };
    
    this.init();
  }

  init() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.updateTheme(this.theme);
    this.createToggleButtons();
    this.bindEvents();
  }

  updateTheme(newTheme) {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
    this.theme = newTheme;
    this.updateToggleButtons();
  }

  createToggleButtons() {
    const toggles = document.querySelectorAll(this.options.selector);
    
    toggles.forEach(toggle => {
      if (toggle.dataset.initialized) return;
      
      const variant = toggle.dataset.variant || this.options.variant;
      const size = toggle.dataset.size || this.options.size;
      
      if (variant === 'switch') {
        this.createSwitchToggle(toggle, size);
      } else {
        this.createButtonToggle(toggle, size);
      }
      
      toggle.dataset.initialized = 'true';
    });
  }

  createButtonToggle(container, size) {
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg'
    };

    container.innerHTML = `
      <button
        class="theme-toggle-btn inline-flex items-center justify-center rounded-lg border transition-colors bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 ${sizeClasses[size]} ${this.options.className}"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        <span role="img" aria-hidden="true" class="theme-icon">
          ${this.theme === 'light' ? '🌙' : '☀️'}
        </span>
      </button>
    `;
  }

  createSwitchToggle(container, size) {
    container.innerHTML = `
      <button
        class="theme-toggle-switch relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 ${this.options.className}"
        aria-label="Toggle theme"
        role="switch"
        aria-checked="${this.theme === 'dark'}"
      >
        <span class="switch-handle inline-block w-4 h-4 transform transition-transform bg-white dark:bg-gray-300 rounded-full ${this.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}">
          <span class="sr-only theme-icon">
            ${this.theme === 'light' ? '☀️' : '🌙'}
          </span>
        </span>
      </button>
    `;
  }

  updateToggleButtons() {
    const buttons = document.querySelectorAll('.theme-toggle-btn, .theme-toggle-switch');
    
    buttons.forEach(button => {
      const icon = button.querySelector('.theme-icon');
      const handle = button.querySelector('.switch-handle');
      
      if (icon) {
        icon.textContent = this.theme === 'light' ? '🌙' : '☀️';
      }
      
      if (handle) {
        if (this.theme === 'dark') {
          handle.classList.remove('translate-x-1');
          handle.classList.add('translate-x-6');
          button.setAttribute('aria-checked', 'true');
        } else {
          handle.classList.remove('translate-x-6');
          handle.classList.add('translate-x-1');
          button.setAttribute('aria-checked', 'false');
        }
      }
      
      button.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
      button.setAttribute('title', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} mode`);
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.closest('.theme-toggle-btn, .theme-toggle-switch')) {
        this.toggle();
      }
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.updateTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggle() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.updateTheme(newTheme);
  }

  destroy() {
    const toggles = document.querySelectorAll(this.options.selector);
    toggles.forEach(toggle => {
      toggle.innerHTML = '';
      delete toggle.dataset.initialized;
    });
  }
}

// Global function to create theme toggle
function createThemeToggle(options = {}) {
  return new ThemeToggle(options);
}

// Auto-initialize if data-theme-toggle elements exist
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('[data-theme-toggle]')) {
    createThemeToggle();
  }
});

// Export for module environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeToggle, createThemeToggle };
}
