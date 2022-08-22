import { useState, useEffect } from 'react';

import { GnosisWrapper } from '../../../assets/typechain-types/gnosis';

const useGnosisSafeAddress = (gnosisWrapper: GnosisWrapper | undefined) => {
  const [gnosisSafeAddress, setGnosisSafeAddress] = useState<string>();

  useEffect(() => {
    if (!gnosisWrapper) {
      setGnosisSafeAddress(undefined);
      return;
    }

    gnosisWrapper.gnosisSafe().then(setGnosisSafeAddress).catch(console.error);
  }, [gnosisWrapper]);

  return gnosisSafeAddress;
};

export default useGnosisSafeAddress;
