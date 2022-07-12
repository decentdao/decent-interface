import { useCallback, useEffect, useState } from 'react';
import { DAOFactory, DAOFactory__factory } from '@fractal-framework/core-contracts';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import { useAddresses } from './useAddresses';

export function useDAOLegacy(daoAddress?: string) {
  const [parentDAO, setParentDAO] = useState<string>();
  const [subsidiaryDAOs, setSubsidiaryDAOs] = useState<string[]>([]);
  const {
    state: { chainId, signerOrProvider },
  } = useWeb3Provider();
  const { daoFactory } = useAddresses(chainId);

  const getPastEvents = useCallback(async (_daoContract: DAOFactory, filter: any) => {
    const events = await _daoContract.queryFilter(filter);
    return events;
  }, []);

  useEffect(() => {
    if (!daoFactory || !signerOrProvider || !daoAddress) {
      return;
    }
    const daoFactoryContract = DAOFactory__factory.connect(daoFactory.address, signerOrProvider);

    // retrieves creation event
    (async () => {
      const creationEvent = await getPastEvents(
        daoFactoryContract,
        daoFactoryContract.filters.DAOCreated(daoAddress)
      );

      const creator = creationEvent[0].args[3];
      // check if creator is a Fractal DAO
      const creatorEvent = await getPastEvents(
        daoFactoryContract,
        daoFactoryContract.filters.DAOCreated(creator)
      );
      setParentDAO(creatorEvent.length ? creator : undefined);
      const subsidiaries = await getPastEvents(
        daoFactoryContract,
        daoFactoryContract.filters.DAOCreated(null, null, null, creator)
      );
      const daoAddresses = subsidiaries.length ? subsidiaries.map(event => event.args[0]) : [];

      setSubsidiaryDAOs(daoAddresses);
    })();
  }, [signerOrProvider, daoFactory, getPastEvents, daoAddress]);

  return { parentDAO, subsidiaryDAOs };
}
