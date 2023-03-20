import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES } from '../../routes/constants';
import { TreasuryAction, GovernanceAction, GnosisAction } from '../../types';
import { useSearchDao } from './useSearchDao';

export default function useDAOController() {
  const {
    gnosis: { safe },
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();
  const { push, query } = useRouter();

  const { errorMessage, address, isLoading, setSearchString } = useSearchDao();

  /**
   * Passes param address to setSearchString
   */
  const loadDAO = useCallback(() => {
    if (safe.address !== query.daoAddress) {
      setSearchString(query.daoAddress! as string);
    }
  }, [safe.address, query.daoAddress, setSearchString]);

  useEffect(() => loadDAO(), [loadDAO]);

  useEffect(() => {
    if (address) {
      (async () => {
        treasuryDispatch({
          type: TreasuryAction.RESET,
        });
        governanceDispatch({
          type: GovernanceAction.RESET,
        });
        gnosisDispatch({
          type: GnosisAction.SET_SAFE_ADDRESS,
          payload: address,
        });
      })();
      return () => {};
    }
  }, [address, gnosisDispatch, governanceDispatch, treasuryDispatch]);

  useEffect(() => {
    if (!isLoading) {
      if (!!errorMessage) {
        toast(errorMessage, { toastId: 'invalid-dao' });
        gnosisDispatch({ type: GnosisAction.INVALIDATE });
        push(BASE_ROUTES.landing);
      }
    }
  }, [errorMessage, isLoading, gnosisDispatch, push]);
}
