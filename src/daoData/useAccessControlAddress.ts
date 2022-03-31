import { useState, useEffect } from 'react';

import { DAO } from '../typechain-types';

const useAccessControlAddress = (dao: DAO | undefined) => {
  const [accessControlAddress, setAccessControlAddress] = useState<string>();

  useEffect(() => {
    if (!dao) {
      setAccessControlAddress(undefined);
      return;
    }

    dao.accessControl()
      .then(setAccessControlAddress)
      .catch(console.error);
  }, [dao]);

  return accessControlAddress;
}

export default useAccessControlAddress;
