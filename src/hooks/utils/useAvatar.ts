import { Address, useEnsAvatar } from 'wagmi';
import { useSupportedENS } from './useChainData';

const useAvatar = (account: string | null) => {
  const { data: avatarURL } = useEnsAvatar({
    address: account as Address,
    chainId: useSupportedENS(),
  });

  return avatarURL;
};

export default useAvatar;
