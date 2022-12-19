import { BigNumber } from 'ethers';
import { IGnosisFreezeData } from '../../providers/Fractal/types';
import useBlockTimestamp from './useBlockTimestamp';

const useWithinFreezePeriod = (freezeData: IGnosisFreezeData, frozenPeriod?: boolean) => {
  const currentTime = BigNumber.from(useBlockTimestamp());

  const secondsLeft = freezeData.freezeProposalCreatedTime
    .add(frozenPeriod ? freezeData.freezePeriod : freezeData.freezeProposalPeriod)
    .sub(currentTime);
  const withinPeriod = secondsLeft.gt(0);

  return { secondsLeft, withinPeriod };
};

export default useWithinFreezePeriod;
