import { MetaFactory } from '../../assets/typechain-types/metafactory';
import useDisplayName from '../../hooks/useDisplayName';
import { useWeb3Provider } from '../web3Data/hooks/useWeb3Provider';
import useCurrentBlockNumber from './useCurrentBlockNumber';
import useCurrentTimestamp from './useCurrentTimestamp';
import useMetaFactoryContract from './useMetaFactoryContract';

export interface BlockchainData {
  currentBlockNumber: number | undefined;
  currentTimestamp: number;
  metaFactoryContract: MetaFactory | undefined;
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
  const metaFactoryContract = useMetaFactoryContract();
  const accountDisplayName = useDisplayName(account);

  const blockchainData: BlockchainData = {
    currentBlockNumber,
    currentTimestamp,
    metaFactoryContract,
    accountDisplayName,
  };

  return blockchainData;
};

export default useBlockchainDatas;
