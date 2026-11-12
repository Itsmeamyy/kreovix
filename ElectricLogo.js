/**
 * ElectricLogo.js — React Bits @react-bits/ElectricLogo
 * Exported for ESM / CommonJS / Browser script usage
 */

const ElectricLogo = (typeof window !== 'undefined' && window.ElectricLogo)
  ? window.ElectricLogo
  : class ElectricLogo {
      constructor(container, options = {}) {
        if (typeof window !== 'undefined' && window.ElectricLogo) {
          return new window.ElectricLogo(container, options);
        }
      }
    };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ElectricLogo;
}
if (typeof window !== 'undefined') {
  window.ElectricLogo = ElectricLogo;
}

export default ElectricLogo;

