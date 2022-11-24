import { Dispatch, useCallback, useEffect } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import useDisplayName from '../../../hooks/utlities/useDisplayName';
import { GnosisAction } from '../constants';
import { GnosisActions } from '../types';

export default function useDAOName({
  address,
  gnosisDispatch,
}: {
  address?: string;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const { fractalNameRegistryContract } = useSafeContracts();
  const { displayName } = useDisplayName(address);

  const getDaoName = useCallback(async () => {
    if (!fractalNameRegistryContract || !address) {
      return '';
    }
    const events = await fractalNameRegistryContract.queryFilter(
      fractalNameRegistryContract.filters.FractalNameUpdated(address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      return displayName;
    }

    const { daoName } = latestEvent.args;

    return daoName;
  }, [fractalNameRegistryContract, address, displayName]);

  useEffect(() => {
    const loadDaoName = async () => {
      gnosisDispatch({
        type: GnosisAction.SET_DAO_NAME,
        payload: await getDaoName(),
      });
    };

    loadDaoName();
  }, [getDaoName, gnosisDispatch]);
}
