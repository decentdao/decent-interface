import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useSearchDao from '../../hooks/DAO/useSearchDao';
import { GnosisAction, TreasuryAction } from '../../providers/Fractal/constants/actions';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { BASE_ROUTES } from '../../routes/constants';
import { GovernanceAction } from './../../providers/Fractal/governance/actions';

export default function useDAOController() {
  const {
    gnosis: { safe, safeService },
    dispatches: { gnosisDispatch, governanceDispatch, treasuryDispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading },
  } = useWeb3Provider();

  const { errorMessage, address, updateSearchString, loading } = useSearchDao();
  const navigate = useNavigate();

  /**
   * Passes param address to updateSearchString
   */
  const loadDAO = useCallback(() => {
    if (safe.address !== params.address && !isProviderLoading) {
      updateSearchString(params.address!);
    }
  }, [safe.address, params.address, updateSearchString, isProviderLoading]);

  useEffect(() => loadDAO(), [loadDAO]);

  useEffect(() => {
    if (address && signerOrProvider && account && safeService) {
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
    if (!loading) {
      if (!!errorMessage) {
        toast(errorMessage, { toastId: 'invalid-dao' });
        gnosisDispatch({ type: GnosisAction.INVALIDATE });
        navigate(BASE_ROUTES.landing);
      }
    }
  }, [errorMessage, account, loading, isProviderLoading, gnosisDispatch, address, navigate]);

  useEffect(() => {
    return () => {
      gnosisDispatch({ type: GnosisAction.RESET });
    };
  }, [gnosisDispatch]);
}
