import { BigNumber } from 'ethers';
import { logError } from '../helpers/errorLogging';
import { CacheExpiry } from '../hooks/utils/cache/cacheDefaults';
import { setValue, getValue } from '../hooks/utils/cache/useLocalStorage';
import { Providers } from '../types/network';

export const getAverageBlockTime = async (provider: Providers) => {
  let averageBlockTime: number = getValue('averageBlockTime', provider.network.chainId);
  if (averageBlockTime) {
    return averageBlockTime;
  }
  const latestBlock = await provider.getBlock('latest');
  const pastBlock = await provider.getBlock(latestBlock.number - 1000);
  averageBlockTime = (latestBlock.timestamp - pastBlock.timestamp) / 1000;
  setValue('averageBlockTime', averageBlockTime, provider.network.chainId, CacheExpiry.ONE_DAY);
  return averageBlockTime;
};

export const getTimeStamp = async (blockNumber: number | 'latest', provider: Providers) => {
  if (!provider || !blockNumber) {
    return 0;
  }
  if (blockNumber === 'latest') {
    const latestBlock = await provider.getBlock('latest');
    return latestBlock.timestamp;
  }
  try {
    const block = await provider.getBlock(blockNumber);
    const latestBlock = await provider.getBlock('latest');

    if (blockNumber < latestBlock.number) {
      return block.timestamp;
    } else {
      const averageBlockTime = await getAverageBlockTime(provider);
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
  provider: Providers
): Promise<number> => {
  if (!provider || !numOfBlocks) {
    return 0;
  }
  try {
    const averageBlockTime = Math.round(await getAverageBlockTime(provider));
    return averageBlockTime * numOfBlocks;
  } catch (error) {
    logError(error);
    return 0;
  }
};

export const getEstimatedNumberOfBlocks = async (
  timeInMinutes: BigNumber,
  provider: Providers
): Promise<BigNumber> => {
  if (!provider || !timeInMinutes) {
    return BigNumber.from(0);
  }

  try {
    const timeInSecondsNumber = timeInMinutes.toNumber() * 60;
    const averageBlockTime = await getAverageBlockTime(provider);

    const blocksToWait = Math.ceil(timeInSecondsNumber / averageBlockTime);
    return BigNumber.from(blocksToWait);
  } catch (error) {
    // @todo maybe shouldn't return 0 here for error handling
    logError(error);
    return BigNumber.from(0);
  }
};
