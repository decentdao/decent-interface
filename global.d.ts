// global.d.ts
export {};

// @dev for ethlizards script
declare global {
  interface Window {
    hj: ((...params: any[]) => void) & { q: [string, any[]][] };
    _hjSettings: { hjid: number; hjsv: number; };
  }
}
