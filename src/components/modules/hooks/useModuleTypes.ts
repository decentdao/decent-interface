import { ModuleTypes } from './../../Modules/types/enums';
import { IERC165, IERC165__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IGovernorModule__factory,
  ITimelock__factory,
} from '../../../assets/typechain-types/module-governor';
import { ITreasuryModule__factory } from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { parseInterface } from '../utils';

// @todo move to global hooks folder
interface IModuleData {
  moduleAddress: string;
  moduleType: string;
}
export function useModuleTypes(moduleAddresses?: string[]) {
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
  const timeLockInterfaces = useMemo(
    () =>
      parseInterface([
        IModuleBase__factory.createInterface(),
        ITimelock__factory.createInterface(),
      ]),
    []
  );

  const [contracts, setContracts] = useState<IERC165[]>();
  const [modules, setModules] = useState<IModuleData[]>([]);

  const interfaceSupport = useCallback((contract: IERC165, interfaces: string[]) => {
    return Promise.all(
      interfaces.map(selector => contract.supportsInterface(selector).catch(() => false))
    ).then(support => ({
      address: contract.address,
      match: support.reduce((p, c) => p && c),
    }));
  }, []);

  useEffect(() => {
    if (!provider || !moduleAddresses || !moduleAddresses.length) {
      return;
    }
    setContracts(
      moduleAddresses.map(moduleAddress => IERC165__factory.connect(moduleAddress, provider))
    );
  }, [moduleAddresses, provider]);

  useEffect(() => {
    if (!contracts || !contracts.length) {
      return;
    }
    const moduleDatas: IModuleData[] = [];
    (async () => {
      await Promise.all(
        contracts.map(async contract => {
          const tokenVotingGovSupportData = await interfaceSupport(contract, governInterfaces);
          if (tokenVotingGovSupportData.match) {
            moduleDatas.push({
              moduleAddress: contract.address,
              moduleType: ModuleTypes.TOKEN_VOTING_GOVERNANCE,
            });
          }
          const treasurySupportData = await interfaceSupport(contract, treasuryInterfaces);
          if (treasurySupportData.match) {
            moduleDatas.push({
              moduleAddress: contract.address,
              moduleType: ModuleTypes.TREASURY,
            });
          }
          const timelockSupportData = await interfaceSupport(contract, timeLockInterfaces);
          if (timelockSupportData.match) {
            moduleDatas.push({
              moduleAddress: contract.address,
              moduleType: ModuleTypes.TIMELOCK,
            });
          }
          return moduleDatas;
        })
      ).then(_modules => setModules(_modules[0]));
    })();
  }, [contracts, governInterfaces, treasuryInterfaces, interfaceSupport, timeLockInterfaces]);
  const timelockModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TIMELOCK),
    [modules]
  );
  const treasuryModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TREASURY),
    [modules]
  );
  const tokenVotingGovernance = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TOKEN_VOTING_GOVERNANCE),
    [modules]
  );

  return { timelockModule, treasuryModule, tokenVotingGovernance };
}
