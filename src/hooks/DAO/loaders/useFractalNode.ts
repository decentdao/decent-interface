import { useCallback, useEffect, useRef, useState } from 'react';
import { Address } from 'viem';
import { useFractal } from '../../../providers/App/AppProvider';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { useLoadDAONode } from './useLoadDAONode';

export const useFractalNode = ({
  addressPrefix,
  safeAddress,
}: {
  addressPrefix?: string;
  safeAddress?: Address;
}) => {
  // tracks the current valid Safe address and chain id; helps prevent unnecessary calls
  const currentValidSafe = useRef<string>();
  const [errorLoading, setErrorLoading] = useState<boolean>(false);

  const { action } = useFractal();

  const { setDaoInfo } = useDaoInfoStore();
  const { loadDao } = useLoadDAONode();

  const reset = useCallback(
    ({ error }: { error: boolean }) => {
      currentValidSafe.current = undefined;
      action.resetSafeState();
      setErrorLoading(error);
    },
    [action],
  );

  const setDAO = useCallback(async () => {
    if (addressPrefix && safeAddress) {
      currentValidSafe.current = `${addressPrefix}${safeAddress}`;
      setErrorLoading(false);

      try {
        const daoInfo = await loadDao(safeAddress);
        if (!daoInfo.safe) {
          throw new Error('Invalid Safe');
        }
        setDaoInfo(daoInfo);
      } catch (e) {
        // TODO: this is the thing causing an error when
        // trying to load a DAO with a valid address which is not a Safe
        // reset({ error: true });
        return;
      }
    }
  }, [addressPrefix, safeAddress, loadDao, setDaoInfo]);

  useEffect(() => {
    if (`${addressPrefix}${safeAddress}` !== currentValidSafe.current) {
      reset({ error: false });
      setDAO();
    }
  }, [addressPrefix, safeAddress, setDAO, reset]);

  return { errorLoading };
};
