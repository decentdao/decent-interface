import { BigNumber } from 'ethers';

export const secondsLeftInFreezePeriod = (
  freezeProposalCreatedTime: BigNumber,
  freezePeriod: BigNumber,
  currentTime: BigNumber
): BigNumber => {
  const secondsLeft = freezeProposalCreatedTime.add(freezePeriod).sub(currentTime);

  return secondsLeft;
};

export const secondsLeftInFreezeProposalPeriod = (
  freezeProposalCreatedTime: BigNumber,
  freezeProposalPeriod: BigNumber,
  currentTime: BigNumber
): BigNumber => {
  const secondsLeft = freezeProposalCreatedTime.add(freezeProposalPeriod).sub(currentTime);

  return secondsLeft;
};

export const isWithinFreezePeriod = (
  freezeProposalCreatedTime: BigNumber,
  freezePeriod: BigNumber,
  currentTime: BigNumber
): boolean => {
  const secondsLeft = secondsLeftInFreezePeriod(
    freezeProposalCreatedTime,
    freezePeriod,
    currentTime
  );

  return secondsLeft.gt(0);
};

export const isWithinFreezeProposalPeriod = (
  freezeProposalCreatedTime: BigNumber,
  freezeProposalPeriod: BigNumber,
  currentTime: BigNumber
): boolean => {
  const secondsLeft = secondsLeftInFreezeProposalPeriod(
    freezeProposalCreatedTime,
    freezeProposalPeriod,
    currentTime
  );

  return secondsLeft.gt(0);
};
