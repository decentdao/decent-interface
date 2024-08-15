import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useFractal } from '../../providers/App/AppProvider';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { NodeAction } from '../../providers/App/node/action';

export const useUpdateSafeData = () => {
  const {
    action,
    node: { safe },
  } = useFractal();
  const safeAPI = useSafeAPI();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const safeAddress = safe?.address;

  useEffect(() => {
    if (!safeAPI || !safeAddress) {
      return;
    }

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
