import { useState } from 'react';

import { DAO } from '@fractal-framework/core-contracts';
import useSafeRace from './useSafeRace';

const useAccessControlAddress = (dao: DAO | undefined) => {
  const [accessControlAddress, setAccessControlAddress] = useState<string>();

  useSafeRace(
    !dao,
    () => setAccessControlAddress(undefined),
    () => dao!.accessControl(),
    address => setAccessControlAddress(address)
  );

  return accessControlAddress;
};

export default useAccessControlAddress;
