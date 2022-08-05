import { FractalDAO } from './../types/fractal';
import { useEffect } from 'react';
import { FractalAction } from '../constants/enums';
import { ACRoleListener, FractalActions } from '../types';

// setups listeners for acesss control
export function useModuleListeners(dao: FractalDAO, dispatch: React.Dispatch<FractalActions>) {
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
      if (!addresses.includes(target)) {
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
  }, [dao.daoContract, dao.accessControlContract, dao.moduleAddresses, dispatch]);
}
