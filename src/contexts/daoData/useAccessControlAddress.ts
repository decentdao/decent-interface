import { useState } from 'react';

import { DAO } from '../../typechain-types';
import useSafeRace from './useSafeRace';

const useAccessControlAddress = (dao: DAO | undefined) => {
  const [accessControlAddress, setAccessControlAddress] = useState<string>();

  useSafeRace(
    !dao,
    () => setAccessControlAddress(undefined),
    () => dao!.accessControl(),
    (address) => setAccessControlAddress(address),
  );

  return accessControlAddress;
}

export default useAccessControlAddress;
