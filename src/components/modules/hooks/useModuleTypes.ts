import { IERC165, IERC165__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import { useEffect, useMemo, useState } from 'react';
import { IGovernorModule__factory } from '../../../assets/typechain-types/module-governor';
import { ITreasuryModule__factory } from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { parseInterface } from '../utils';

interface IModuleData {
  moduleAddress: string;
  moduleType: string;
}
export function useModuleTypes(moduleAddress: string | null) {
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

  const [contract, setContracts] = useState<IERC165>();
  const [module, setModule] = useState<IModuleData | undefined>();

  useEffect(() => {
    if (!provider || !moduleAddress || moduleAddress === contract?.address) {
      return;
    }

    setContracts(IERC165__factory.connect(moduleAddress, provider));
  }, [moduleAddress, provider, contract]);

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
            moduleType: 'VotingTokenGovernance',
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
            moduleType: 'Treasury',
          };
        }
        setModule(moduleData);
      })();
    }
  }, [contract, governInterfaces, treasuryInterfaces]);

  return module;
}
