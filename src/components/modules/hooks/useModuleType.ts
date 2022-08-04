import { IERC165, IERC165__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import { useEffect, useMemo, useState } from 'react';
import { IGovernorModule__factory } from '../../../assets/typechain-types/module-governor';
import { ITreasuryModule__factory } from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { ModuleTypes } from '../types';
import { parseInterface } from '../utils';

// @todo move to global hooks folder
interface IModuleData {
  moduleAddress: string;
  moduleType: ModuleTypes;
}
export function useModuleType(moduleAddress: string | null) {
  const {
    state: { provider },
  } = useWeb3Provider();

  const governInterfaces = useMemo(
    () =>
      parseInterface([
        IModuleBase__factory.createInterface(),
        IGovernorModule__factory.createInterface(),
      ]),
    []
  );

  const treasuryInterfaces = useMemo(
    () =>
      parseInterface([
        IModuleBase__factory.createInterface(),
        ITreasuryModule__factory.createInterface(),
      ]),
    []
  );

  const [contract, setContract] = useState<IERC165>();
  const [module, setModule] = useState<IModuleData | undefined>();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (!provider || !moduleAddress) {
      setContract(undefined);
      return;
    }

    setContract(IERC165__factory.connect(moduleAddress, provider));
  }, [moduleAddress, provider]);

  useEffect(() => {
    if (contract) {
      let moduleData: IModuleData | undefined;
      (async () => {
        const tokenVotingGovSupport = await Promise.all(
          governInterfaces.map(selector => contract.supportsInterface(selector).catch(() => false))
        );
        const tokenVotingGovSupportData = {
          address: contract.address,
          match: tokenVotingGovSupport.reduce((p, c) => p && c),
        };
        if (tokenVotingGovSupportData.match) {
          moduleData = {
            moduleAddress: contract.address,
            moduleType: ModuleTypes.TOKEN_VOTING_GOVERNANCE,
          };
        }
        const treasurySupport = await Promise.all(
          treasuryInterfaces.map(selector =>
            contract.supportsInterface(selector).catch(() => false)
          )
        );
        const treasurySupportData = {
          address: contract.address,
          match: treasurySupport.reduce((p, c) => p && c),
        };
        if (treasurySupportData.match) {
          moduleData = {
            moduleAddress: contract.address,
            moduleType: ModuleTypes.TREASURY,
          };
        }
        if (moduleData) {
          setModule(moduleData);
        } else {
          setModule(undefined);
          setContract(undefined);
        }
        console.log('HERE');
        setLoading(false);
      })();
    }
  }, [contract, governInterfaces, treasuryInterfaces]);

  return { isLoading, module };
}
