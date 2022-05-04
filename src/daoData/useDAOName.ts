import { useState } from 'react';

import { DAO } from '../typechain-types';
import useSafeRace from './useSafeRace';

const useDAOName = (dao: DAO | undefined) => {
  const [name, setName] = useState<string>();

  useSafeRace(
    !dao,
    () => setName(undefined),
    () => dao!.name(),
    (daoName) => setName(daoName),
  );

  return name;
}

export default useDAOName;
