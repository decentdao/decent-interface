import { useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';

const GNOSIS_CHAINS: { [key: string]: string } = {
  '1': 'eth',
  '4': 'rin',
  '5': 'gor',
};

function useGnosisSafeLink(address: string | undefined) {
  const { chain } = useNetwork();
  const [gnosisSafeLink, setGnosisSafeLink] = useState<string>();

  useEffect(() => {
    if (!chain || !address) {
      setGnosisSafeLink(undefined);
      return;
    }

    setGnosisSafeLink(
      `https://gnosis-safe.io/app/${GNOSIS_CHAINS[chain.id.toString()]}:${address}/home`
    );
  }, [address, chain]);

  return gnosisSafeLink;
}

export default useGnosisSafeLink;
