import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { IGnosisFreezeData, IGnosisVetoContract } from '../../../../providers/Fractal/types';
import { DAO_ROUTES } from '../../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu({
  safeAddress,
  freezeData,
  guardContracts,
}: {
  safeAddress: string;
  freezeData?: IGnosisFreezeData;
  guardContracts: IGnosisVetoContract;
}) {
  const navigate = useNavigate();
  const currentTime = BigNumber.from(useBlockTimestamp());

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => navigate(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };
    if (
      freezeData &&
      !isWithinFreezeProposalPeriod(
        freezeData.freezeProposalCreatedTime,
        freezeData.freezeProposalPeriod,
        currentTime
      ) &&
      !isWithinFreezePeriod(
        freezeData.freezeProposalCreatedTime,
        freezeData.freezePeriod,
        currentTime
      ) &&
      freezeData.userHasVotes
    ) {
      const freezeOption = {
        optionKey: 'optionInitiateFreeze',
        onClick: () => guardContracts.vetoVotingContract?.asSigner.castFreezeVote(),
      };
      return [createSubDAOOption, freezeOption];
    } else if (
      freezeData &&
      isWithinFreezePeriod(
        freezeData.freezeProposalCreatedTime,
        freezeData.freezePeriod,
        currentTime
      ) &&
      freezeData.userHasVotes
    ) {
      const clawbackOption = {
        optionKey: 'optionInitiateClawback',
        onClick: () => null,
      };
      return [clawbackOption];
    } else {
      return [createSubDAOOption];
    }
  }, [safeAddress, navigate, guardContracts, freezeData, currentTime]);

  return (
    <OptionMenu
      trigger={
        <VEllipsis
          boxSize="1.5rem"
          mt="0.25rem"
        />
      }
      titleKey="titleManageDAO"
      options={options}
      namespace="menu"
    />
  );
}
