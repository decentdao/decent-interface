import { MetaFactory } from '../../assets/typechain-types/metafactory';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useCurrentTimestamp from './useCurrentTimestamp';
import useMetaFactoryContract from './useMetaFactoryContract';

export interface BlockchainData {
  currentBlockNumber: number | undefined;
  currentTimestamp: number;
  metaFactoryContract: MetaFactory | undefined;
}

export type BlockchainDataContext = BlockchainData;

export const defaultBlockchainDataResponse = {} as BlockchainData;

const useBlockchainDatas = () => {
  const currentBlockNumber = useCurrentBlockNumber();
  const currentTimestamp = useCurrentTimestamp(currentBlockNumber);
  const metaFactoryContract = useMetaFactoryContract();

  const blockchainData: BlockchainData = {
    currentBlockNumber,
    currentTimestamp,
    metaFactoryContract,
  };

  return blockchainData;
};

export default useBlockchainDatas;
