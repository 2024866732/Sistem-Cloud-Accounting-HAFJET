import '@testing-library/jest-dom'

// Polyfill matchMedia if needed
if (!window.matchMedia) {
  // @ts-ignore
  window.matchMedia = () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
}
