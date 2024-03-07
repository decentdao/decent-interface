import { useContext } from 'react';
import { EthersContext } from '..';

export function useEthersSigner() {
  const { signer } = useContext(EthersContext);
  return signer;
}
