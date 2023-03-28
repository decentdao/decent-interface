import { useQuery } from '@apollo/client';
import { useEffect, Dispatch } from 'react';
import { DAOQueryDocument } from '../../../.graphclient';
import { IGnosis, GnosisActions, GnosisAction } from '../../types';
import useDAOName from '../DAO/useDAOName';

export default function useDAOQuery({
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

  // To prevent executing GraphQL queries for each DAO name request - we're using useDAOName inside useDAOQuery and not vice versa
  const { daoRegistryName } = useDAOName({ address: gnosis.safe.address, registryName });

  useEffect(() => {
    if (!error && data) {
      const daos = data.daos;
      const dao = daos[0];
      if (dao) {
        const { parentAddress, hierarchy } = dao as any;
        gnosisDispatch({
          type: GnosisAction.SET_DAO_DATA,
          payload: {
            parentDAOAddress: parentAddress,
            daoName: daoRegistryName,
            hierarchy,
          },
        });
      }
    }
  }, [error, data, gnosisDispatch, daoRegistryName]);
}
