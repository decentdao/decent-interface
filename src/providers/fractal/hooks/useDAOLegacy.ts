import { DAOFactory, DAOFactory__factory } from '@fractal-framework/core-contracts';
import { useCallback, useEffect, useState } from 'react';
import { useAddresses } from '../../../hooks/useAddresses';
import { DAOCreationListener } from '../types';
import { useWeb3Provider } from './../../../contexts/web3Data/hooks/useWeb3Provider';

// @todo Update to use for Gnosis v1
/**
 *
 * @param daoAddress address of current DAO
 * @returns parentDAO (string) and subsidiaryDAOs (string[]) if these exists
 */
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

    // retrieves creation event for current DAO
    (async () => {
      const creationEvent = await getPastEvents(
        daoFactoryContract,
        daoFactoryContract.filters.DAOCreated(daoAddress)
      );

      const creator = creationEvent[0].args[3];

      // checks for DAO creation event for creator address
      const isDaoParent = (
        await getPastEvents(daoFactoryContract, daoFactoryContract.filters.DAOCreated(creator))
      ).length;

      // retrieves DAOs created by current DAO
      const subsidiaries = await getPastEvents(
        daoFactoryContract,
        daoFactoryContract.filters.DAOCreated(null, null, null, daoAddress)
      );

      const daoAddresses = subsidiaries.length ? subsidiaries.map(event => event.args[0]) : [];

      setParentDAO(isDaoParent ? creator : undefined);
      setSubsidiaryDAOs(daoAddresses);
    })();

    const createDAOEventListener: DAOCreationListener = async (
      _daoAddress: string,
      _accessControl: string,
      _sender: string,
      _creator: string
    ) => {
      if (_creator === daoAddress) {
        setSubsidiaryDAOs(prevState => [...prevState, _daoAddress]);
      }
    };

    daoFactoryContract.on(
      daoFactoryContract.filters.DAOCreated(null, null, null, daoAddress),
      createDAOEventListener
    );

    return () => {
      daoFactoryContract.off(
        daoFactoryContract.filters.DAOCreated(null, null, null, daoAddress),
        createDAOEventListener
      );
    };
  }, [signerOrProvider, daoFactory, getPastEvents, daoAddress]);

  return { parentDAO, subsidiaryDAOs };
}
