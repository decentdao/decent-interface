declare global {
  interface BigInt {
    /** Convert BigInt to string form in JSON.stringify */
    toJSON: () => string;
  }
}

export {};
