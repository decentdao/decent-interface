import { useEnsAvatar } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

const useAvatar = (account?: string) => {
  const { chain } = useNetworkConfig();
  const { data: avatarURL } = useEnsAvatar({
    name: account,
    chainId: chain.id,
  });

  return avatarURL;
};

export default useAvatar;
