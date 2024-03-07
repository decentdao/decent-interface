import { useContext } from 'react';
import { EthersContext } from '..';

export function useEthersProvider() {
  const { provider } = useContext(EthersContext);
  return provider;
}
