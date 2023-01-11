import { useEffect, useState } from 'react';
import { useNetworkConfg } from '../../providers/NetworkConfig/NetworkConfigProvider';

const GNOSIS_CHAINS: { [key: string]: string } = {
  '1': 'eth',
  '4': 'rin',
  '5': 'gor',
};

function useGnosisSafeLink(address: string | undefined) {
  const { chainId } = useNetworkConfg();
  const [gnosisSafeLink, setGnosisSafeLink] = useState<string>();

  useEffect(() => {
    if (!address) {
      setGnosisSafeLink(undefined);
      return;
    }

    setGnosisSafeLink(
      `https://gnosis-safe.io/app/${GNOSIS_CHAINS[chainId.toString()]}:${address}/home`
    );
  }, [address, chainId]);

  return gnosisSafeLink;
}

export default useGnosisSafeLink;
