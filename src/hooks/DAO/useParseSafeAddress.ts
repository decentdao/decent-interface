import { useSearchParams } from 'react-router-dom';
import { isAddress } from 'viem';
import { validPrefixes } from '../../providers/NetworkConfig/networks';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';

export const useParseSafeAddress = () => {
  const [searchParams] = useSearchParams();
  const addressWithPrefix = searchParams.get('dao');
  const queryPrefixAndAddress = addressWithPrefix?.split(':');
  const queryAddressPrefix = queryPrefixAndAddress?.[0];
  const queryDaoAddress = queryPrefixAndAddress?.[1];

  const { addressPrefix } = useNetworkConfigStore();

  if (
    queryAddressPrefix === undefined ||
    queryDaoAddress === undefined ||
    !validPrefixes.has(queryAddressPrefix) ||
    !isAddress(queryDaoAddress)
  ) {
    return {
      invalidQuery: true,
      wrongNetwork: false,
      addressPrefix: undefined,
      safeAddress: undefined,
    };
  }

  if (queryAddressPrefix !== addressPrefix) {
    return {
      invalidQuery: false,
      wrongNetwork: true,
      addressPrefix: queryAddressPrefix,
      safeAddress: undefined,
    };
  }

  return {
    invalidQuery: false,
    wrongNetwork: false,
    addressPrefix: queryAddressPrefix,
    safeAddress: queryDaoAddress,
  };
};
