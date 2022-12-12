import { Dispatch, useEffect } from 'react';
import { GnosisAction } from '../constants';
import { IGnosis, GnosisActions, GnosisModuleType } from '../types';

export default function useNodes({
  gnosis,
  gnosisDispatch,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  useEffect(() => {
    const loadDaoParent = async () => {
      const { modules, safe } = gnosis;
      const fractalModule = modules.find(module => module.moduleType === GnosisModuleType.FRACTAL);

      if (fractalModule && fractalModule.moduleContract) {
        const fractalModuleOwner = await fractalModule.moduleContract.owner();
        if (fractalModuleOwner !== safe.address) {
          // When DAO don't have parent - module's address equals to DAO safe address.
          // Otherwise - we can be sure that module's owner is parent DAO
          gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: fractalModuleOwner });
        }
      }
    };

    loadDaoParent();
  }, [gnosis, gnosisDispatch]);
}
