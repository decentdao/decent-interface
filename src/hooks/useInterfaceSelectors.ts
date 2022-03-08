import { useState, useEffect } from 'react';
import { utils, BigNumber } from 'ethers';

const useInterfaceSelectors = (interfaces: utils.Interface[]) => {
  const [selectors, setSelectors] = useState<string[]>();

  useEffect(() => {
    setSelectors(interfaces.map(iface => {
      return Object.keys(iface.functions)
        .reduce((p, c) => {
          const functionFragment = iface.functions[c];
          const sigHash = iface.getSighash(functionFragment);
          return p.xor(BigNumber.from(sigHash))
        }, BigNumber.from(0))
        .toHexString();
    }));
  }, [interfaces]);

  return selectors
}

export default useInterfaceSelectors;
