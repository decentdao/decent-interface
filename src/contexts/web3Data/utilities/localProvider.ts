import { ethers, providers } from 'ethers';
import { logError } from '../../../helpers/errorLogging';
import { LocalInjectedProviderInfo } from '../types';

/**
 * Creates a readonly provider connected to a running local node
 */
export const localFallbackProvider = () => {
  const localProvider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_LOCAL_PROVIDER_URL
  );

  return {
    account: null,
    provider: localProvider,
    signerOrProvider: localProvider,
    connectionType: 'local provider',
    network: 'localhost',
    chainId: parseInt(process.env.LOCAL_PROVIDER_CHAIN_ID || '31337', 10),
  };
};

/**
 * Creates a local provider connected as a Signer
 * This connection automatically signs transactions
 */
export const localProviderAsSigner = async (): Promise<LocalInjectedProviderInfo | undefined> => {
  const localProvider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_LOCAL_PROVIDER_URL
  );

  try {
    const network = await localProvider.detectNetwork();
    const signerOrProvider = localProvider.getSigner();
    const account = await (signerOrProvider as providers.JsonRpcSigner).getAddress();

    return {
      account,
      provider: localProvider,
      signerOrProvider,
      connectionType: 'local provider',
      network: 'localhost',
      chainId: network.chainId,
    };
  } catch (e) {
    logError('Local Provider: ', (e as Error).message);
  }
};
