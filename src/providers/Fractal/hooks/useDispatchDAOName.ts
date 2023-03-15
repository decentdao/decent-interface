import { Dispatch, useEffect } from 'react';
import useDAOName from '../../../hooks/DAO/useDAOName';
import { GnosisActions, GnosisAction } from '../../../types';

export default function useDispatchDAOName({
  address,
  gnosisDispatch,
}: {
  address?: string;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const { daoRegistryName } = useDAOName({ address });

  useEffect(() => {
    if (!address) {
      return;
    }
    const loadDaoName = async () => {
      gnosisDispatch({
        type: GnosisAction.SET_DAO_NAME,
        payload: daoRegistryName,
      });
    };
    loadDaoName();
  }, [gnosisDispatch, address, daoRegistryName]);
}
