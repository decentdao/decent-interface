import { utils, BigNumber } from 'ethers';

const getInterfaceSelector = (iface: utils.Interface) => {
  return Object.keys(iface.functions)
    .reduce((p, c) => {
      const functionFragment = iface.functions[c];
      const sigHash = iface.getSighash(functionFragment);
      return p.xor(BigNumber.from(sigHash))
    }, BigNumber.from(0))
    .toHexString();
}

export default getInterfaceSelector;
