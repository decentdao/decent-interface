import { Dispatch, useCallback, useEffect } from 'react';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import { createAccountSubstring } from '../../../hooks/utils/useDisplayName';
import useENSName from '../../../hooks/utils/useENSName';
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
  const ensName = useENSName(address);

  const getDaoName = useCallback(
    async (_address: string) => {
      if (ensName) {
        return ensName;
      }
      if (!fractalNameRegistryContract) {
        return createAccountSubstring(address!);
      }
      const events = await fractalNameRegistryContract.queryFilter(
        fractalNameRegistryContract.filters.FractalNameUpdated(_address)
      );

      const latestEvent = events[0];
      if (!latestEvent) {
        return createAccountSubstring(address!);
      }

      const { daoName } = latestEvent.args;

      return daoName;
    },
    [address, ensName, fractalNameRegistryContract]
  );

  useEffect(() => {
    if (!address) {
      return;
    }
    const loadDaoName = async () => {
      gnosisDispatch({
        type: GnosisAction.SET_DAO_NAME,
        payload: await getDaoName(address),
      });
    };
    loadDaoName();
  }, [getDaoName, gnosisDispatch, address]);
}
