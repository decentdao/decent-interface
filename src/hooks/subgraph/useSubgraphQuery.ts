import { useQuery } from '@apollo/client';
import { useEffect, Dispatch } from 'react';
import { DAOQueryDocument } from '../../.graphclient/';
import { IGnosis, GnosisActions, GnosisAction } from '../../types';
import useDAOName from '../DAO/useDAOName';

export default function useSubgraphQuery({
  gnosis,
  gnosisDispatch,
}: {
  gnosis: IGnosis;
  gnosisDispatch: Dispatch<GnosisActions>;
}) {
  const { error, data } = useQuery(DAOQueryDocument, {
    variables: { daoAddress: gnosis.safe.address },
  });

  const registryName = data?.daos[0]?.name;

  const { daoRegistryName } = useDAOName({ address: gnosis.safe.address, registryName });

  useEffect(() => {
    if (!error && data) {
      const daos = data.daos;
      const dao = daos[0];
      if (dao) {
        console.log(dao);
        const { parentAddress, hierarchy } = dao;
        // TODO: This could/should be single dispatch
        gnosisDispatch({ type: GnosisAction.SET_DAO_PARENT, payload: parentAddress });
        gnosisDispatch({ type: GnosisAction.SET_DAO_NAME, payload: daoRegistryName });
        gnosisDispatch({ type: GnosisAction.SET_DAO_HIERARCHY, payload: hierarchy });
      }
    }
  }, [error, data, gnosisDispatch, daoRegistryName]);
}
