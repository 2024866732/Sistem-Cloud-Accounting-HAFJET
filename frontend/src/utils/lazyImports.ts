// Re-export implementations from the TSX source to avoid JSX parsing in .ts files
export {
  createLazyComponent,
  preloadComponent,
  useLazyLoad,
  trackLoadTime
} from './lazyImports.tsx';