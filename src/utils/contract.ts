import { PublicClient } from 'viem';
import { logError } from '../helpers/errorLogging';
import { CacheExpiry } from '../hooks/utils/cache/cacheDefaults';
import { setValue, getValue } from '../hooks/utils/cache/useLocalStorage';

export const getAverageBlockTime = async (publicClient: PublicClient) => {
  const chainId = await publicClient.getChainId();
  let averageBlockTime = getValue('averageBlockTime', chainId);
  if (averageBlockTime) {
    return averageBlockTime;
  }
  const latestBlock = await publicClient.getBlock();
  const pastBlock = await publicClient.getBlock({ blockNumber: latestBlock.number - 1000n });
  averageBlockTime = (latestBlock.timestamp - pastBlock.timestamp) / 1000n;
  setValue('averageBlockTime', averageBlockTime, chainId, CacheExpiry.ONE_DAY);
  return averageBlockTime;
};

export const getTimeStamp = async (blockNumber: bigint | 'latest', publicClient: PublicClient) => {
  if (!publicClient || !blockNumber) {
    return 0;
  }
  if (blockNumber === 'latest') {
    const latestBlock = await publicClient.getBlock();
    return latestBlock.timestamp;
  }
  try {
    const block = await publicClient.getBlock({ blockNumber });
    const latestBlock = await publicClient.getBlock();

    if (blockNumber < latestBlock.number) {
      return block.timestamp;
    } else {
      const averageBlockTime = await getAverageBlockTime(publicClient);
      const estimatedTimestamp =
        latestBlock.timestamp + averageBlockTime * (blockNumber - latestBlock.number);

      return estimatedTimestamp;
    }
  } catch (error) {
    logError(error);
    return 0;
  }
};

export const blocksToSeconds = async (
  numOfBlocks: number,
  publicClient: PublicClient,
): Promise<number> => {
  if (!publicClient || !numOfBlocks) {
    return 0;
  }
  try {
    const averageBlockTime = Math.round(await getAverageBlockTime(publicClient));
    return averageBlockTime * numOfBlocks;
  } catch (error) {
    logError(error);
    return 0;
  }
};

export const getEstimatedNumberOfBlocks = async (
  timeInMinutes: bigint,
  publicClient: PublicClient,
): Promise<bigint> => {
  const seconds = Number(timeInMinutes) * 60;
  const averageBlockTime = await getAverageBlockTime(publicClient);
  return BigInt(Math.ceil(seconds / averageBlockTime));
};
