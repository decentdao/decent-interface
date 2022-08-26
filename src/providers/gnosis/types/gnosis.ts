export type GnosisSafeStatusResponse = {
  address: string;
  nonce: number;
  threshold: number;
  owners: string[];
  masterCopy: string;
  modules: [string];
  fallbackHandler: string;
  guard: string;
  version: string;
};
