import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { IGnosisFreezeData, IGnosisVetoContract } from '../../../../providers/Fractal/types';
import { DAO_ROUTES } from '../../../../routes/constants';
import { OptionMenu } from '../OptionMenu';

interface IManageDAOMenu {
  parentSafeAddress?: string;
  safeAddress: string;
  freezeData?: IGnosisFreezeData;
  guardContracts: IGnosisVetoContract;
}

export function ManageDAOMenu({
  parentSafeAddress,
  safeAddress,
  freezeData,
  guardContracts,
}: IManageDAOMenu) {
  const navigate = useNavigate();
  const currentTime = BigNumber.from(useBlockTimestamp());
  const { handleClawBack } = useClawBack({
    parentSafeAddress,
    childSafeAddress: safeAddress,
  });

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
      freezeData.isFrozen &&
      freezeData.userHasVotes
    ) {
      const clawBackOption = {
        optionKey: 'optionInitiateClawback',
        onClick: handleClawBack,
      };

      return [clawBackOption];
    } else {
      return [createSubDAOOption];
    }
  }, [safeAddress, navigate, guardContracts, handleClawBack, freezeData, currentTime]);

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
