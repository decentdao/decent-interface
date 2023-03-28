import { FractalRegistry } from '@fractal-framework/fractal-contracts';
import { TypedListener } from '@fractal-framework/fractal-contracts/dist/typechain-types/common';
import { FractalNameUpdatedEvent } from '@fractal-framework/fractal-contracts/dist/typechain-types/contracts/FractalRegistry';
import { useCallback, useEffect } from 'react';
import { useProvider } from 'wagmi';
import { getEventRPC } from '../../../helpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { NodeAction } from '../../../providers/App/node/action';
import { createAccountSubstring } from '../../utils/useDisplayName';
import { useLocalStorage, CacheKeys } from '../../utils/useLocalStorage';

/**
 * Gets the 'display name' for a Fractal DAO, in the following order of preference:
 *
 * 1. Primary ENS Name (reverse record)
 * 2. Fractal name registry name
 * 3. Truncated Eth address in the form 0xbFC4...7551
 */
export default function useDAOName() {
  const {
    node: { daoAddress },
    dispatch,
    baseContracts: { fractalRegistryContract },
  } = useFractal();

  const provider = useProvider();
  const networkId = provider.network.chainId;

  const { setValue, getValue } = useLocalStorage();

  const getDaoName = useCallback(
    async ({ address }: { address: string }) => {
      const cachedName = getValue(CacheKeys.DAO_NAME_PREFIX + address);
      if (cachedName) {
        return cachedName;
      }

      const ensName = await provider.lookupAddress(address);

      if (ensName) {
        setValue(CacheKeys.DAO_NAME_PREFIX + address, ensName, 60);
        return ensName;
      }

      const rpc = getEventRPC<FractalRegistry>(fractalRegistryContract, networkId);
      const events = await rpc.queryFilter(rpc.filters.FractalNameUpdated(address));

      const latestEvent = events.pop();
      if (!latestEvent) {
        return createAccountSubstring(address);
      }

      const { daoName } = latestEvent.args;
      setValue(CacheKeys.DAO_NAME_PREFIX + address, daoName, 60);
      return daoName;
    },
    [fractalRegistryContract, getValue, networkId, setValue, provider]
  );

  useEffect(() => {
    if (!daoAddress) return;
    const listenerCallback: TypedListener<FractalNameUpdatedEvent> = daoName => {
      setValue(CacheKeys.DAO_NAME_PREFIX + daoAddress, daoName, 60);
      dispatch.node({ type: NodeAction.UPDATE_DAO_NAME, payload: daoName });
    };

    const rpc = getEventRPC<FractalRegistry>(fractalRegistryContract, networkId);
    const filter = rpc.filters.FractalNameUpdated(daoAddress);

    rpc.on(filter, listenerCallback);
    // set listeners for dao name updates
    return () => {
      rpc.off(filter, listenerCallback);
    };
  }, [daoAddress, dispatch, fractalRegistryContract, networkId, setValue]);

  return getDaoName;
}
