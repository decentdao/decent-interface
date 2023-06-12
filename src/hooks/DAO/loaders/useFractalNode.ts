import { useQuery } from '@apollo/client';
import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useNetwork, useProvider } from 'wagmi';
import { DAOQueryDocument, DAOQueryQuery } from '../../../../.graphclient';
import { BASE_ROUTES } from '../../../constants/routes';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeAction } from '../../../providers/App/node/action';
import { disconnectedChain } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { Node } from '../../../types';
import { mapChildNodes } from '../../../utils/hierarchy';
import { useUpdateTimer } from '../../utils/useUpdateTimer';
import { useLazyDAOName } from '../useDAOName';
import { useFractalModules } from './useFractalModules';

const ONE_MINUTE = 60 * 1000;

export const useFractalNode = ({ daoAddress }: { daoAddress?: string }) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string | undefined>();
  const {
    clients: { safeService },
    action,
  } = useFractal();
  const { getDaoName } = useLazyDAOName();
  const { t } = useTranslation('dashboard');
  const { replace } = useRouter();
  const provider = useProvider();
  const { chain } = useNetwork();

  const lookupModules = useFractalModules();
  const { setMethodOnInterval } = useUpdateTimer(currentValidAddress.current);

  const invalidateDAO = useCallback(
    (errorMessage: string) => {
      // invalid DAO
      toast(errorMessage, { toastId: 'invalid-dao' });
      action.resetDAO();
      replace(BASE_ROUTES.landing);
    },
    [action, replace]
  );

  const formatDAOQuery = useCallback((result: { data?: DAOQueryQuery }, _daoAddress: string) => {
    if (!result.data) {
      return;
    }
    const { daos } = result.data;
    const dao = daos[0];
    if (dao) {
      const { parentAddress, name, hierarchy, snapshotURL } = dao;

      const currentNode: Node = {
        nodeHierarchy: {
          parentAddress: parentAddress as string,
          childNodes: mapChildNodes(hierarchy),
        },
        daoName: name as string,
        daoAddress: utils.getAddress(_daoAddress as string),
        daoSnapshotURL: snapshotURL as string,
      };
      return currentNode;
    }
    return;
  }, []);

  const chainName = provider.network.name === 'homestead' ? 'mainnet' : provider.network.name;

  useQuery(DAOQueryDocument, {
    variables: { daoAddress },
    onCompleted: async data => {
      if (!daoAddress) return;
      const graphNodeInfo = formatDAOQuery({ data }, daoAddress);
      const daoName = await getDaoName(utils.getAddress(daoAddress), graphNodeInfo?.daoName);

      if (!!graphNodeInfo) {
        action.dispatch({
          type: NodeAction.SET_DAO_INFO,
          payload: Object.assign(graphNodeInfo, { daoName }),
        });
      } else {
        action.dispatch({
          type: NodeAction.UPDATE_DAO_NAME,
          payload: daoName,
        });
      }
    },
    context: { chainName },
    pollInterval: ONE_MINUTE,
  });

  const updateSafeInfo = useCallback(
    async (_daoAddress: string) => {
      const safeInfo = await safeService.getSafeInfo(utils.getAddress(_daoAddress));
      if (!safeInfo) return;

      action.dispatch({
        type: NodeAction.SET_FRACTAL_MODULES,
        payload: await lookupModules(safeInfo.modules),
      });
      action.dispatch({
        type: NodeAction.SET_SAFE_INFO,
        payload: safeInfo,
      });
      return safeInfo;
    },
    [action, safeService, lookupModules]
  );

  const setDAO = useCallback(
    async (_daoAddress: string) => {
      if (utils.isAddress(_daoAddress) && safeService) {
        try {
          const safe = await setMethodOnInterval(() => updateSafeInfo(_daoAddress), ONE_MINUTE);
          if (!safe) {
            invalidateDAO(t('errorInvalidSearch'));
            return;
          }
        } catch (e) {
          // network error
          logError(e);
          invalidateDAO(
            t('errorFailedSearch', { chain: chain ? chain.name : disconnectedChain.name })
          );
        }
      } else {
        // invalid address
        invalidateDAO(
          t('errorFailedSearch', { chain: chain ? chain.name : disconnectedChain.name })
        );
      }
    },
    [safeService, setMethodOnInterval, updateSafeInfo, invalidateDAO, t, chain]
  );

  useEffect(() => {
    const isCurrentAddress = daoAddress === currentValidAddress.current;
    if (!currentValidAddress.current) {
      if (currentValidAddress.current === undefined) {
        currentValidAddress.current = daoAddress;
      }
      if (!isCurrentAddress && daoAddress) {
        setDAO(daoAddress);
      }
    }
  }, [daoAddress, setDAO, action, currentValidAddress]);
};
