import { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Address } from 'viem';
import { useSafeAPI } from '../../providers/App/hooks/useSafeAPI';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { useDecentModules } from '../DAO/loaders/useDecentModules';

export const useUpdateSafeData = (safeAddress?: Address) => {
  const safeAPI = useSafeAPI();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const lookupModules = useDecentModules();
  const { setSafeInfo, setDecentModules } = useDaoInfoStore();

  useEffect(() => {
    if (!safeAPI || !safeAddress) {
      return;
    }

    // Retrieve latest safe info on page/url change
    // @todo - do we need to check if the safeAddress has changed?
    if (prevPathname.current !== location.pathname) {
      (async () => {
        const safeInfo = await safeAPI.getSafeData(safeAddress);

        setSafeInfo(safeInfo);
        setDecentModules(await lookupModules(safeInfo.modules));
      })();
      prevPathname.current = location.pathname;
    }
  }, [safeAddress, safeAPI, location, setSafeInfo, setDecentModules, lookupModules]);
};
