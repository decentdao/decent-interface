// vitest.setup.js
import { vi } from 'vitest';

vi.mock('viem', () => {
  return {
    getAddress: (address) => {
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Invalid Ethereum address');
      }
      return address;
    },
    isAddress: (address) => /^0x[a-fA-F0-9]{40}$/.test(address),
  };
});