import useDisplayName from '../../hooks/utils/useDisplayName';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useCurrentTimestamp from './useCurrentTimestamp';

export interface BlockchainData {
  currentBlockNumber: number | undefined;
  currentTimestamp: number;
  accountDisplayName: string;
}

export type BlockchainDataContext = BlockchainData;

export const defaultBlockchainDataResponse = {} as BlockchainData;

const useBlockchainDatas = () => {
  const {
    state: { account },
  } = useWeb3Provider();

  const currentBlockNumber = useCurrentBlockNumber();
  const currentTimestamp = useCurrentTimestamp(currentBlockNumber);
  const { displayName: accountDisplayName } = useDisplayName(account);

  const blockchainData: BlockchainData = {
    currentBlockNumber,
    currentTimestamp,
    accountDisplayName,
  };

  return blockchainData;
};

export default useBlockchainDatas;
