// import { getLDOContract } from '@lido-sdk/contracts';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
// import useSubmitProposal from '../../DAO/proposal/useSubmitProposal';

export default function useLidoStake() {
  const { staking } = useNetworkConfig();
//   const { submitProposal } = useSubmitProposal();

  const handleStake = async () => {
    if (!staking.lido) {
      // Means it is not supported on current network
      return;
    }
  };

  return handleStake;
}
