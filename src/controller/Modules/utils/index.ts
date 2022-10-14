import { utils, BigNumber } from 'ethers';

export function parseInterface(interfaces: utils.Interface[]): string[] {
  return interfaces.map(iface => {
    return Object.keys(iface.functions)
      .reduce((p, c) => {
        const functionFragment = iface.functions[c];
        const sigHash = iface.getSighash(functionFragment);
        return p.xor(BigNumber.from(sigHash));
      }, BigNumber.from(0))
      .toHexString();
  });
}
