import axios from 'axios';
import { DAO__factory, DAOAccessControl__factory } from '@fractal-framework/core-contracts';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { logError } from '../../helpers/errorLogging';
import useSearchDao from '../../hooks/useSearchDao';
import {
  GnosisAction,
  MVDAction,
  NodeAction,
  NodeType,
} from '../../providers/fractal/constants/enums';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisSafe, ModuleActionRoleEvents } from '../../providers/fractal/types';
import { buildGnosisApiUrl } from '../../providers/gnosis/helpers';

/**
 * Handles DAO validation, setting and unsetting of DAO and nagivating to DAOSearch when invalid
 */
export function DAOController({ children }: { children: JSX.Element }) {
  const {
    node: { dispatch: nodeDispatch },
    mvd: { dispatch: mvdDispatch },
    gnosis: { dispatch: gnosisDispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading, chainId },
  } = useWeb3Provider();

  const { errorMessage, address, addressNodeType, updateSearchString } = useSearchDao();

  /**
   * Passes param address to updateSearchString
   */
  const loadDAO = useCallback(() => {
    updateSearchString(params.address!);
  }, [params.address, updateSearchString]);

  useEffect(() => loadDAO(), [loadDAO]);

  /**
   *
   */
  const retrieveMVD = useCallback(async () => {
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

  const retrieveGnosis = useCallback(async () => {
    const { data } = await axios.get<GnosisSafe>(buildGnosisApiUrl(chainId, `/safes/${address}`));
    return data;
  }, [address, chainId]);

  useEffect(() => {
    if (address && signerOrProvider && account) {
      if (addressNodeType === NodeType.MVD) {
        (async () => {
          nodeDispatch({
            type: NodeAction.SET_NODE_TYPE,
            payload: NodeType.MVD,
          });
          mvdDispatch({
            type: MVDAction.SET_DAO,
            payload: await retrieveMVD(),
          });
        })();
      }
      if (addressNodeType === NodeType.GNOSIS) {
        (async () => {
          nodeDispatch({
            type: NodeAction.SET_NODE_TYPE,
            payload: NodeType.GNOSIS,
          });
          gnosisDispatch({
            type: GnosisAction.SET_SAFE,
            payload: await retrieveGnosis(),
          });
        })();
      }
    }
  }, [
    address,
    signerOrProvider,
    addressNodeType,
    retrieveMVD,
    mvdDispatch,
    account,
    nodeDispatch,
    gnosisDispatch,
    retrieveGnosis,
  ]);

  useEffect(() => {
    if (!isProviderLoading && (errorMessage || !account)) {
      toast(errorMessage);
      nodeDispatch({ type: NodeAction.INVALID });
      mvdDispatch({ type: MVDAction.INVALID });
      gnosisDispatch({ type: GnosisAction.INVALIDATE });
    }
  }, [errorMessage, mvdDispatch, account, isProviderLoading, nodeDispatch, gnosisDispatch]);

  useEffect(() => {
    return () => {
      nodeDispatch({ type: NodeAction.RESET });
      mvdDispatch({ type: MVDAction.RESET });
      gnosisDispatch({ type: GnosisAction.RESET });
    };
  }, [nodeDispatch, mvdDispatch, gnosisDispatch]);
  return children;
}
