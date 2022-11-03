import axios from 'axios';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import useSafeContracts from '../../hooks/useSafeContracts';
import useSearchDao from '../../hooks/useSearchDao';
import { GnosisAction } from '../../providers/fractal/constants/actions';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisSafe } from '../../providers/fractal/types';
import { buildGnosisApiUrl } from '../../providers/fractal/utils';
import { BASE_ROUTES } from '../../routes/constants';

/**
 * Handles DAO validation, setting and unsetting of DAO and nagivating to DAOSearch when invalid
 */
export function DAOController({ children }: { children: JSX.Element }) {
  const { fractalNameRegistryContract } = useSafeContracts();
  const {
    gnosis: { safe },
    dispatches: { gnosisDispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading, chainId },
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

  const retrieveGnosis = useCallback(async () => {
    const { data } = await axios.get<GnosisSafe>(buildGnosisApiUrl(chainId, `/safes/${address}`));
    return data;
  }, [address, chainId]);

  const getDaoName = useCallback(async () => {
    if (!fractalNameRegistryContract || !safe.address) {
      return '';
    }
    const events = await fractalNameRegistryContract.queryFilter(
      fractalNameRegistryContract.filters.FractalNameUpdated(safe.address)
    );

    const latestEvent = events[0];
    if (!latestEvent) {
      return '';
    }

    const { daoName } = latestEvent.args;

    return daoName;
  }, [fractalNameRegistryContract, safe.address]);

  useEffect(() => {
    if (address && signerOrProvider && account) {
      (async () => {
        gnosisDispatch({
          type: GnosisAction.SET_SAFE,
          payload: await retrieveGnosis(),
        });
        gnosisDispatch({
          type: GnosisAction.SET_DAO_NAME,
          payload: await getDaoName(),
        });
      })();
    }
  }, [address, signerOrProvider, account, gnosisDispatch, retrieveGnosis, getDaoName]);

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
