import { buildGnosisApiUrl } from '../helpers';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import axios from 'axios';
import { GnosisTransaction } from '../types/gnosis';

/**
 * hook for posting transaction data to the Gnosis Safe service
 * @param safeAddress
 * @param data
 */
export async function useGnosisApiServicesPost(
  safeAddress: string | undefined,
  data: GnosisTransaction
) {
  const {
    state: { chainId },
  } = useWeb3Provider();

  if (!safeAddress) {
    return;
  }
  try {
    await axios.post(
      buildGnosisApiUrl(chainId, `/safes/${safeAddress}/multisig-transactions`),
      data
    );
  } catch (e) {
    console.log(e);
  }
}
