import { DAO__factory, DAOAccessControl__factory } from '@fractal-framework/core-contracts';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../helpers/errorLogging';
import useSearchDao from '../../hooks/useSearchDao';
import { FractalAction } from '../../providers/fractal/constants/enums';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { ModuleActionRoleEvents } from '../../providers/fractal/types';

/**
 * Handles DAO validation, setting and unsetting of DAO and nagivating to DAOSearch when invalid
 */
export function DAOController({ children }: { children: JSX.Element }) {
  const {
    mvd: { dispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading },
  } = useWeb3Provider();

  const { errorMessage, address, addressIsDAO, updateSearchString } = useSearchDao();

  /**
   * Passes param address to updateSearchString
   */
  const loadDAO = useCallback(() => {
    updateSearchString(params.address!);
  }, [params.address, updateSearchString]);

  /**
   *
   */
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
        logError("shouldn't see this, trying to remove event that wasn't added");
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
  useEffect(() => loadDAO(), [loadDAO]);

  useEffect(() => {
    if (addressIsDAO && address && signerOrProvider && account) {
      (async () => {
        dispatch({
          type: FractalAction.SET_DAO,
          payload: await retrieveDAO(),
        });
      })();
    }
  }, [address, signerOrProvider, addressIsDAO, retrieveDAO, dispatch, account]);

  useEffect(() => {
    if (!isProviderLoading && (errorMessage || !account)) {
      toast(errorMessage);
      (async () => {
        dispatch({
          type: FractalAction.INVALID,
        });
      })();
    }
  }, [errorMessage, dispatch, account, isProviderLoading]);

  useEffect(() => {
    return () => {
      dispatch({ type: FractalAction.RESET });
    };
  }, [dispatch]);
  return children;
}
