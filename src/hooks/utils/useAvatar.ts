import { useEnsAvatar } from 'wagmi';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';

const useAvatar = (name: string) => {
  const { chain } = useNetworkConfig();
  const { data: avatarURL } = useEnsAvatar({
    name: name?.toLowerCase(),
    chainId: chain.id,
  });

  return avatarURL;
};

export default useAvatar;
