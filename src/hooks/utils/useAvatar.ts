import { Address, useEnsAvatar, useProvider } from 'wagmi';
import { chainsArr } from '../../providers/NetworkConfig/rainbow-kit.config';

const useAvatar = (account: string | null) => {
  const provider = useProvider();
  const networkId = provider.network.chainId;
  const { data: avatarURL } = useEnsAvatar({
    address: account as Address,
    chainId: [137].includes(networkId) ? chainsArr[0].id : networkId,
  });

  return avatarURL;
};

export default useAvatar;
