import { BigNumber } from 'ethers';
import { IGnosisFreezeData } from '../providers/Fractal/types';

export const secondsLeftInFreezePeriod = (
  freezeData: IGnosisFreezeData,
  currentTime: BigNumber
): BigNumber => {
  const secondsLeft = freezeData.freezeProposalCreatedTime
    .add(freezeData.freezePeriod)
    .sub(currentTime);

  return secondsLeft;
};

export const secondsLeftInFreezeProposalPeriod = (
  freezeData: IGnosisFreezeData,
  currentTime: BigNumber
): BigNumber => {
  const secondsLeft = freezeData.freezeProposalCreatedTime
    .add(freezeData.freezeProposalPeriod)
    .sub(currentTime);

  return secondsLeft;
};

export const isWithinFreezePeriod = (
  freezeData: IGnosisFreezeData,
  currentTime: BigNumber
): boolean => {
  const secondsLeft = secondsLeftInFreezePeriod(freezeData, currentTime);

  return secondsLeft.gt(0);
};

export const isWithinFreezeProposalPeriod = (
  freezeData: IGnosisFreezeData,
  currentTime: BigNumber
): boolean => {
  const secondsLeft = secondsLeftInFreezeProposalPeriod(freezeData, currentTime);

  return secondsLeft.gt(0);
};
