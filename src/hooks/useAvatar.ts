import { useState, useEffect } from 'react';

import { useWeb3Provider } from '../contexts/web3Data/hooks/useWeb3Provider';
import useENSName from './useENSName';

const useAvatar = (account: string | null) => {
  const {
    state: { provider },
  } = useWeb3Provider();
  const ensName = useENSName(account);

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  useEffect(() => {
    if (!provider || !ensName) {
      setAvatarURL(null);
      return;
    }

    provider.getAvatar(ensName).then(setAvatarURL).catch(console.error);
  }, [ensName, provider]);

  return avatarURL;
};

export default useAvatar;
