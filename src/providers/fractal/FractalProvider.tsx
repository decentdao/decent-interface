import { DAOAccessControl__factory, DAO__factory } from '@fractal-framework/core-contracts';
import { ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react';
import { useParams } from 'react-router-dom';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';

import useSearchDao from '../../hooks/useSearchDao';
import { initialState } from './constants';
import { FractalAction } from './constants/enums';
import { useDAOLegacy } from './hooks/useDAOLegacy';
import { FractalContext } from './hooks/useFractal';
import {
  ACRoleListener,
  FractalActions,
  FractalDAO,
  IDaoLegacy,
  ModuleActionRoleEvents,
} from './types';

const initializeState = (_initialState: FractalDAO) => {
  return _initialState;
};

export const reducer = (state: FractalDAO, action: FractalActions): FractalDAO => {
  switch (action.type) {
    case FractalAction.SET_DAO:
      return { ...action.payload, isLoading: false };
    case FractalAction.UPDATE_MODULE:
      return { ...state, moduleAddresses: action.payload };
    case FractalAction.RESET:
      return initializeState(initialState);
    case FractalAction.INVALID:
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
};

export function FractalProvider({ children }: { children: ReactNode }) {
  const [dao, dispatch] = useReducer(reducer, initialState, initializeState);
  const params = useParams();
  const { errorMessage, address, addressIsDAO, updateSearchString } = useSearchDao();
  const {
    state: { signerOrProvider },
  } = useWeb3Provider();
  const daoLegacy: IDaoLegacy = useDAOLegacy(dao.daoAddress);

  const loadDAO = () => {
    if (dao.isLoading) {
      updateSearchString(params.address!);
    }
  };

  const retrieveDAO = useCallback(async () => {
    const daoAddress = address;
    const daoContract = DAO__factory.connect(daoAddress!, signerOrProvider!);
    const daoName = await daoContract!.name();
    const accessControlAddress = await daoContract.accessControl();
    const accessControlContract = DAOAccessControl__factory.connect(
      accessControlAddress,
      signerOrProvider!
    );
    // retrieves action roles added events
    const actionRoles = (
      await accessControlContract.queryFilter(accessControlContract.filters.ActionRoleAdded())
    )
      .filter(event => event.args.target !== daoContract.address)
      .map(event => event.args.target);

    // retrieves action roles removed events
    const actionRolesRemoved = (
      await accessControlContract.queryFilter(accessControlContract.filters.ActionRoleRemoved())
    )
      .filter(event => event.args.target !== daoContract.address)
      .map(event => event.args.target);

    const moduleEventsMapping = new Map<string, ModuleActionRoleEvents>();

    actionRoles.forEach(target => {
      const module = moduleEventsMapping.get(target);
      if (!module) {
        moduleEventsMapping.set(target, { address: target, moduleEnabled: 1 });
      } else {
        moduleEventsMapping.set(target, { ...module, moduleEnabled: module.moduleEnabled++ });
      }
    });

    actionRolesRemoved.forEach(target => {
      const module = moduleEventsMapping.get(target);
      if (!module) {
        console.error("shouldn't see this, trying to remove event that wasn't added");
      } else {
        moduleEventsMapping.set(target, { ...module, moduleEnabled: module.moduleEnabled-- });
      }
    });

    const moduleAddresses = Array.from(moduleEventsMapping.values())
      .filter(v => v.moduleEnabled)
      .map(v => v.address);

    return {
      daoAddress,
      daoContract,
      daoName,
      accessControlAddress,
      accessControlContract,
      moduleAddresses,
    };
  }, [address, signerOrProvider]);

  useEffect(() => loadDAO);

  useEffect(() => {
    if (addressIsDAO && address && signerOrProvider) {
      (async () => {
        dispatch({
          type: FractalAction.SET_DAO,
          payload: await retrieveDAO(),
        });
      })();
    }
  }, [address, signerOrProvider, addressIsDAO, retrieveDAO]);

  useEffect(() => {
    if (errorMessage) {
      (async () => {
        dispatch({
          type: FractalAction.INVALID,
        });
      })();
    }
  });

  useEffect(() => {
    if (!dao.daoContract || !dao.accessControlContract) {
      return;
    }
    const addFilter = dao.accessControlContract.filters.ActionRoleAdded();

    const addRoleEventListener: ACRoleListener = (target: string) => {
      if (target === dao.daoContract!.address) {
        return;
      }
      const addresses = dao.moduleAddresses || [];
      if (!addresses?.includes(target)) {
        dispatch({
          type: FractalAction.UPDATE_MODULE,
          payload: [...addresses, target],
        });
      }
    };
    const removefilter = dao.accessControlContract.filters.ActionRoleRemoved();

    const removeRoleListener: ACRoleListener = (target: string) => {
      if (target === dao.daoContract!.address) {
        return;
      }
      const addresses = dao.moduleAddresses || [];
      if (!addresses?.includes(target)) {
        dispatch({
          type: FractalAction.UPDATE_MODULE,
          payload: [...addresses, target],
        });
      }
    };

    dao.accessControlContract.on(addFilter, addRoleEventListener);
    dao.accessControlContract.on(removefilter, removeRoleListener);

    return () => {
      dao.accessControlContract!.off(addFilter, addRoleEventListener);
      dao.accessControlContract!.off(removefilter, removeRoleListener);
    };
  }, [dao.daoContract, dao.accessControlContract, dao.moduleAddresses]);

  const value = useMemo(
    () => ({
      dao,
      daoLegacy,
    }),
    [dao, daoLegacy]
  );
  return <FractalContext.Provider value={value}>{children}</FractalContext.Provider>;
}
