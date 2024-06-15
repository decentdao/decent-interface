import { MultisigFreezeVoting__factory } from '@fractal-framework/fractal-contracts';
import { useMemo } from 'react';
import { useEthersProvider } from '../../providers/Ethers/hooks/useEthersProvider';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import useSignerOrProvider from '../utils/useSignerOrProvider';

export default function useSafeContracts() {
  const signerOrProvider = useSignerOrProvider();
  const provider = useEthersProvider();

  const {
    contracts: { multisigFreezeVotingMasterCopy },
  } = useNetworkConfig();

  const daoContracts = useMemo(() => {
    if (!signerOrProvider || !provider) {
      return;
    }

    const freezeMultisigVotingMasterCopyContract = {
      asSigner: MultisigFreezeVoting__factory.connect(
        multisigFreezeVotingMasterCopy,
        signerOrProvider,
      ),
      asProvider: MultisigFreezeVoting__factory.connect(multisigFreezeVotingMasterCopy, provider),
    };

    return {
      freezeMultisigVotingMasterCopyContract,
    };
  }, [multisigFreezeVotingMasterCopy, signerOrProvider, provider]);

  return daoContracts;
}
