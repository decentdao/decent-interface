import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GnosisAction, TreasuryAction } from '../../providers/Fractal/constants/actions';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { BASE_ROUTES } from '../../routes/constants';
import { GovernanceAction } from './../../providers/Fractal/governance/actions';
import { useSearchDao } from './useSearchDao';

export default function useDAOController() {
  const {
    gnosis: { safe },
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();
  const params = useParams();

  const { errorMessage, address, isLoading, setSearchString } = useSearchDao();
  const navigate = useNavigate();

  /**
   * Passes param address to setSearchString
   */
  const loadDAO = useCallback(() => {
    if (safe.address !== params.address) {
      setSearchString(params.address!);
    }
  }, [safe.address, params.address, setSearchString]);

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
        navigate(BASE_ROUTES.landing);
      }
    }
  }, [errorMessage, isLoading, gnosisDispatch, navigate]);
}
