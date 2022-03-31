import { useState, useEffect } from 'react';

import { DAO } from '../typechain-types';

const useDAOName = (dao: DAO | undefined) => {
  const [name, setName] = useState<string>();

  useEffect(() => {
    if (!dao) {
      setName(undefined);
      return;
    }

    dao.name()
      .then(setName)
      .catch(console.error);
  }, [dao]);

  return name;
}

export default useDAOName;
