import { useCallback, useEffect } from 'react';
import { useFractal } from './useFractal';
import useDisplayName from '../../../hooks/useDisplayName';
import useSafeContracts from '../../../hooks/useSafeContracts';
import { GnosisAction } from '../constants';

export default function useDAOName() {
  const {
    gnosis: { safe },
    dispatches: { gnosisDispatch },
  } = useFractal();
  const { fractalNameRegistryContract } = useSafeContracts();
  const safeDisplayName = useDisplayName(safe?.address);

  const getDaoName = useCallback(async () => {
    if (!fractalNameRegistryContract || !safe?.address) {
      return '';
    }
    const events = await fractalNameRegistryContract.queryFilter(
      fractalNameRegistryContract.filters.FractalNameUpdated(safe.address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      return safeDisplayName;
    }

    const { daoName } = latestEvent.args;

    return daoName;
  }, [fractalNameRegistryContract, safe?.address, safeDisplayName]);

  useEffect(() => {
    const loadDaoName = async () => {
      gnosisDispatch({
        type: GnosisAction.SET_DAO_NAME,
        payload: await getDaoName(),
      });
    };

    loadDaoName();
  });
}
