import { useState, useEffect } from 'react';
import { utils } from 'ethers';
import getInterfaceSelector from '../utils/getInterfaceSelector';
import { ERC165 } from '../typechain';

const useSupportsInterfaces = (contract: ERC165 | undefined, interfaces: utils.Interface[]) => {
  const [supportsInterfaces, setSupportsInterfaces] = useState<boolean>();

  useEffect(() => {
    if (!contract) {
      setSupportsInterfaces(undefined);
      return;
    }

    Promise.all(interfaces.map(iface => {
      const selector = getInterfaceSelector(iface);
      return contract.supportsInterface(selector);
    }))
      .then(supports => setSupportsInterfaces(supports.reduce((p, c) => p && c)))
      .catch(() => setSupportsInterfaces(false));
  }, [contract, interfaces]);

  return supportsInterfaces;
}

export default useSupportsInterfaces;
