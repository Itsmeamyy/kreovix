/**
 * GlowCursor.js — React Bits @react-bits/GlowCursor
 * Exported for ESM / CommonJS / Browser script usage
 */

// If window.GlowCursor is already defined by glow-cursor.js, reuse it
const GlowCursor = (typeof window !== 'undefined' && window.GlowCursor)
  ? window.GlowCursor
  : class GlowCursor {
      constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;
        this.options = Object.assign({
          color: '#ffe9a5',
          intensity: 1.3,
          trailWidth: 3,
          linger: 1.4,
          glow: 1.2,
          clickBurst: true,
          theme: 'dark'
        }, options);
        if (typeof window !== 'undefined' && window.GlowCursor) {
          return new window.GlowCursor(container, options);
        }
      }
    };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlowCursor;
}
if (typeof window !== 'undefined') {
  window.GlowCursor = GlowCursor;
}

export default GlowCursor;

