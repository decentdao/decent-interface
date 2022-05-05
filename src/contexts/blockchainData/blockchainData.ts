import useCurrentBlockNumber from './useCurrentBlockNumber';
import useCurrentTimestamp from './useCurrentTimestamp';

export interface BlockchainData {
  currentBlockNumber: number | undefined,
  currentTimestamp: number,
};

export type BlockchainDataContext = BlockchainData;

export const defaultBlockchainDataResponse = {} as BlockchainData;

const useBlockchainDatas = () => {
  const currentBlockNumber = useCurrentBlockNumber();
  const currentTimestamp = useCurrentTimestamp(currentBlockNumber);

  const blockchainData: BlockchainData = {
    currentBlockNumber,
    currentTimestamp,
  };

  return blockchainData;
};

export default useBlockchainDatas;
