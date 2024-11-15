import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../providers/App/node/action';

export const useUpdateSafeData = (safeAddress?: Address) => {
  const { action } = useFractal();
  const safeAPI = useSafeAPI();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);

  useEffect(() => {
    if (!safeAPI || !safeAddress) {
      return;
    }

    // Retrieve latest safe info on page/url change
    // @todo - do we need to check if the safeAddress has changed?
    if (prevPathname.current !== location.pathname) {
      (async () => {
        const safeInfo = await safeAPI.getSafeData(safeAddress);

        action.dispatch({
          type: NodeAction.SET_SAFE_INFO,
          payload: safeInfo,
        });
      })();
      prevPathname.current = location.pathname;
    }
  }, [action, safeAddress, safeAPI, location]);
};
