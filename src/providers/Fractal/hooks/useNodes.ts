import axios from 'axios';
import { Dispatch, useEffect } from 'react';
import { useWeb3Provider } from '../../Web3Data/hooks/useWeb3Provider';
import { GnosisAction } from '../constants';
import { IGnosis, GnosisActions, GnosisModuleType } from '../types';
import { buildGnosisApiUrl } from '../utils';

export default function useNodes({
  gnosis,
  gnosisDispatch,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const {
    state: { chainId },
  } = useWeb3Provider();
  const { modules, safe } = gnosis;
  useEffect(() => {
    const loadDaoParent = async () => {
      const fractalModule = modules.find(module => module.moduleType === GnosisModuleType.FRACTAL);
      if (fractalModule && fractalModule.moduleContract) {
        const fractalModuleOwner = await fractalModule.moduleContract.owner();
        if (fractalModuleOwner !== safe.address) {
          // When DAO don't have parent - module's address equals to DAO safe address.
          // Otherwise - we can be sure that module's owner is parent DAO
          gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: fractalModuleOwner });
        }
      } else {
        // Clearing the state
        gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: '' });
      }
    };

    const loadDaoNodes = async () => {
      if (safe.address) {
        const ownedSafesResponse = await axios.get(
          buildGnosisApiUrl(chainId, `/owners/${safe.address}/safes/`)
        );
        const ownedSafes = ownedSafesResponse.data;
        console.log(ownedSafes);
      }
    };

    loadDaoParent();
    loadDaoNodes();
  }, [chainId, safe.address, modules, gnosisDispatch]);
}
