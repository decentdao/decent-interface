import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GnosisAction, TreasuryAction } from '../../providers/Fractal/constants/actions';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { BASE_ROUTES } from '../../routes/constants';
import { GovernanceAction } from './../../providers/Fractal/governance/actions';
import { useSearchDao } from './useSearchDao';

export default function useDAOController() {
  const {
    gnosis: { safe, safeService },
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading },
  } = useWeb3Provider();

  const { errorMessage, address, isLoading, setSearchString } = useSearchDao();
  const navigate = useNavigate();

  /**
   * Passes param address to setSearchString
   */
  const loadDAO = useCallback(() => {
    if (safe.address !== params.address && !isProviderLoading) {
      setSearchString(params.address!);
    }
  }, [safe.address, params.address, setSearchString, isProviderLoading]);

  useEffect(() => loadDAO(), [loadDAO]);

  useEffect(() => {
    if (address && signerOrProvider && safeService) {
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
    }
  }, [
    address,
    signerOrProvider,
    account,
    gnosisDispatch,
    safeService,
    governanceDispatch,
    treasuryDispatch,
  ]);

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
