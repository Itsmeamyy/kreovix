/**
 * FlexCarousel.js — React Bits @react-bits/FlexCarousel
 * Exported for ESM / CommonJS / Browser script usage
 */

const FlexCarousel = (typeof window !== 'undefined' && window.FlexCarousel)
  ? window.FlexCarousel
  : class FlexCarousel {
      constructor(container, options = {}) {
        if (typeof window !== 'undefined' && window.FlexCarousel) {
          return new window.FlexCarousel(container, options);
        }
      }
    };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FlexCarousel;
}
if (typeof window !== 'undefined') {
  window.FlexCarousel = FlexCarousel;
}

export default FlexCarousel;

