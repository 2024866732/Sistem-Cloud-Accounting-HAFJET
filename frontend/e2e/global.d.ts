// TypeScript global declaration for axe-core injected by Playwright
declare global {
  interface Window {
    axe: {
      run: (context?: any, options?: any) => Promise<any>
    }
  }
}
export {};
