import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../providers/App/node/action';

export const useUpdateSafeData = (daoAddress?: Address) => {
  const {
    action,
    // node: { daoAddress },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (!safeAPI || !daoAddress) {
      return;
    }

    // Retrieve lastest safe info on page/url change
    if (prevPathname.current !== location.pathname) {
      (async () => {
        const safeInfo = await safeAPI.getSafeData(daoAddress);

        action.dispatch({
          type: NodeAction.SET_SAFE_INFO,
          payload: safeInfo,
        });
      })();
      prevPathname.current = location.pathname;
    }
  }, [action, daoAddress, safeAPI, location]);
};
