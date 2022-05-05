import { useState, useEffect } from 'react';

import { useWeb3 } from '../contexts/web3Data';
import useENSName from './useENSName';

const useAvatar = (account: string | undefined) => {
  const [{ provider }] = useWeb3();
  const ensName = useENSName(account)

  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  useEffect(() => {
    if (!provider || !ensName) {
      setAvatarURL(null);
      return;
    }

    provider.getAvatar(ensName)
      .then(setAvatarURL)
      .catch(console.error);
  }, [ensName, provider]);

  return avatarURL;
}

export default useAvatar;
