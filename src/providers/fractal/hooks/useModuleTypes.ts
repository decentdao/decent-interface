import { ModuleTypes } from '../../../controller/Modules/types/enums';
import { IERC165, IERC165__factory, IModuleBase__factory } from '@fractal-framework/core-contracts';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IGovernorModule__factory,
  ITimelock__factory,
} from '../../../assets/typechain-types/module-governor';
import { ITreasuryModule__factory } from '../../../assets/typechain-types/module-treasury';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { parseInterface } from '../../../controller/Modules/utils';
import { IClaimSubsidiary__factory } from '../../../assets/typechain-types/votes-token';
import { IGnosisWrapper__factory } from '../../../assets/typechain-types/gnosis-wrapper';
import { IModuleData } from '../../../controller/Modules/types';

// @todo move to global hooks folder
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
  const claimingInterfaces = useMemo(
    () =>
      parseInterface([
        IModuleBase__factory.createInterface(),
        IClaimSubsidiary__factory.createInterface(),
      ]),
    []
  );
  const gnosisWrapperInterfaces = useMemo(
    () =>
      parseInterface([
        IModuleBase__factory.createInterface(),
        IGnosisWrapper__factory.createInterface(),
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
          const claimingSupportData = await interfaceSupport(contract, claimingInterfaces);
          if (claimingSupportData.match) {
            moduleDatas.push({
              moduleAddress: contract.address,
              moduleType: ModuleTypes.CLAIMING,
            });
          }
          const gnosisWrapperSupportData = await interfaceSupport(
            contract,
            gnosisWrapperInterfaces
          );
          if (gnosisWrapperSupportData.match) {
            moduleDatas.push({
              moduleAddress: contract.address,
              moduleType: ModuleTypes.GNOSIS_WRAPPER,
            });
          }
          return moduleDatas;
        })
      ).then(_modules => setModules(_modules[0]));
    })();
  }, [
    contracts,
    governInterfaces,
    treasuryInterfaces,
    interfaceSupport,
    timeLockInterfaces,
    claimingInterfaces,
    gnosisWrapperInterfaces,
  ]);
  const timelockModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TIMELOCK),
    [modules]
  );
  const treasuryModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TREASURY),
    [modules]
  );
  const tokenVotingGovernanceModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.TOKEN_VOTING_GOVERNANCE),
    [modules]
  );
  const claimingContractModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.CLAIMING),
    [modules]
  );
  const gnosisWrapperModule = useMemo(
    () => modules.find(v => v.moduleType === ModuleTypes.GNOSIS_WRAPPER),
    [modules]
  );

  return {
    timelockModule,
    treasuryModule,
    tokenVotingGovernanceModule,
    claimingContractModule,
    gnosisWrapperModule,
  };
}
