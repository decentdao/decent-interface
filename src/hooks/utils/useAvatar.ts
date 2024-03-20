import { useEnsAvatar } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

const useAvatar = (account?: string) => {
  const { chainId } = useNetworkConfig();
  const { data: avatarURL } = useEnsAvatar({
    name: account,
    chainId,
  });

  return avatarURL;
};

export default useAvatar;
