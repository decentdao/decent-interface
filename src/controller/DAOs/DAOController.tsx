import axios from 'axios';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import useSearchDao from '../../hooks/useSearchDao';
import {
  GnosisAction,
} from '../../providers/fractal/constants/enums';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { GnosisSafe } from '../../providers/fractal/types';
import { buildGnosisApiUrl } from '../../providers/gnosis/helpers';

/**
 * Handles DAO validation, setting and unsetting of DAO and nagivating to DAOSearch when invalid
 */
export function DAOController({ children }: { children: JSX.Element }) {
  const {
    gnosis: { dispatch: gnosisDispatch },
  } = useFractal();
  const params = useParams();
  const {
    state: { signerOrProvider, account, isProviderLoading, chainId },
  } = useWeb3Provider();

  const { errorMessage, address, addressNodeType, updateSearchString } = useSearchDao();

  /**
   * Passes param address to updateSearchString
   */
  const loadDAO = useCallback(() => {
    updateSearchString(params.address!);
  }, [params.address, updateSearchString]);

  useEffect(() => loadDAO(), [loadDAO]);

  const retrieveGnosis = useCallback(async () => {
    const { data } = await axios.get<GnosisSafe>(buildGnosisApiUrl(chainId, `/safes/${address}`));
    return data;
  }, [address, chainId]);

  useEffect(() => {
    if (address && signerOrProvider && account) {
        (async () => {
          gnosisDispatch({
            type: GnosisAction.SET_SAFE,
            payload: await retrieveGnosis(),
          });
        })();
    }
  }, [
    address,
    signerOrProvider,
    addressNodeType,
    account,
    gnosisDispatch,
    retrieveGnosis,
  ]);

  useEffect(() => {
    if (!isProviderLoading && (errorMessage || !account)) {
      toast(errorMessage);
      gnosisDispatch({ type: GnosisAction.INVALIDATE });
    }
  }, [errorMessage, account, isProviderLoading, gnosisDispatch]);

  useEffect(() => {
    return () => {
      gnosisDispatch({ type: GnosisAction.RESET });
    };
  }, [gnosisDispatch]);
  return children;
}
