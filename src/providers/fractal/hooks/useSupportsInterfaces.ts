import { useState, useEffect } from 'react';
import { utils } from 'ethers';

import { ERC165 } from '@fractal-framework/core-contracts';
import { ContractMatch } from '../types';
import useInterfaceSelectors from './useInterfaceSelectors';

const useSupportsInterfaces = (contracts: ERC165[] | undefined, interfaces: utils.Interface[]) => {
  const [supportsInterfaces, setSupportsInterfaces] = useState<ContractMatch[]>();
  const interfaceSelectors = useInterfaceSelectors(interfaces);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);

    if (!contracts || !interfaceSelectors) {
      setSupportsInterfaces(undefined);
      setLoading(false);
      return;
    }

    Promise.all(
      contracts.map(contract =>
        Promise.all(
          interfaceSelectors.map(selector =>
            contract.supportsInterface(selector).catch(() => false)
          )
        ).then(contractSupports => ({
          address: contract.address,
          match: contractSupports.reduce((p, c) => p && c),
        }))
      )
    )
      .then(allContractsSupports => setSupportsInterfaces(allContractsSupports))
      .finally(() => setLoading(false));
  }, [contracts, interfaceSelectors]);

  return [supportsInterfaces, loading] as const;
};

export default useSupportsInterfaces;
