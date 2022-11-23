import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import useSearchDao from '../../hooks/useSearchDao';
import { GnosisAction } from '../../providers/fractal/constants/actions';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { BASE_ROUTES } from '../../routes/constants';

/**
 * Handles DAO validation, setting and unsetting of DAO and nagivating to DAOSearch when invalid
 */
export function DAOController({ children }: { children: JSX.Element }) {
  const {
    gnosis: { safe, safeService },
    dispatches: { gnosisDispatch },
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
        gnosisDispatch({
          type: GnosisAction.SET_SAFE,
          payload: await safeService.getSafeInfo(address),
        });
      })();
    }
  }, [address, signerOrProvider, account, gnosisDispatch, safeService]);

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
  return children;
}
