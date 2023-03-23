import { utils } from 'ethers';
import { useRouter } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { BASE_ROUTES } from '../../../constants/routes';
import { logError } from '../../../helpers/errorLogging';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeAction } from '../../../providers/App/node/action';
import useDAOName from './useDAOName';
import { useFractalModules } from './useFractalModules';

export const useFractalNode = ({ daoAddress }: { daoAddress: string }) => {
  // tracks the current valid DAO address; helps prevent unnecessary calls
  const currentValidAddress = useRef<string>();
  const {
    clients: { safeService },
    dispatch,
  } = useFractal();

  const { push } = useRouter();

  const lookupModules = useFractalModules();
  const getDAOName = useDAOName();

  const invalidateDAO = useCallback(
    (errorMessage: string) => {
      // invalid DAO
      currentValidAddress.current = undefined;
      toast(errorMessage, { toastId: 'invalid-dao' });
      push(BASE_ROUTES.landing);
      dispatch.resetDAO();
    },
    [dispatch, push]
  );

  // loads dao from safe
  const loadDao = useCallback(async () => {
    if (utils.isAddress(daoAddress)) {
      try {
        currentValidAddress.current = daoAddress;
        const safe = await safeService.getSafeInfo(daoAddress);
        const fractalModules = await lookupModules(safe.modules);

        // @todo move subgraph call here, this would move heirarchy to FractalNode?
        const daoName = await getDAOName({ address: daoAddress });
        dispatch.node({
          type: NodeAction.SET_DAO_NODE,
          payload: { daoAddress: utils.getAddress(safe.address), safe, fractalModules, daoName },
        });
        console.count('safeInfoRequests');
      } catch (e) {
        logError(e);
        invalidateDAO('errorInvalidSearch');
      }
    } else {
      // invalid address
      invalidateDAO('errorFailedSearch');
    }
  }, [daoAddress, safeService, invalidateDAO, lookupModules, getDAOName, dispatch]);

  useEffect(() => {
    if (daoAddress !== currentValidAddress.current) {
      loadDao();
    }
  }, [daoAddress, loadDao]);
};
