import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { DAO_ROUTES } from '../../../../constants/routes';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { FractalGuardContracts, FreezeGuard } from '../../../../types';
import { OptionMenu } from '../OptionMenu';

interface IManageDAOMenu {
  parentAddress?: string | null;
  safeAddress: string;
  freezeData?: FreezeGuard;
  guardContracts: FractalGuardContracts;
}

export function ManageDAOMenu({
  parentAddress,
  safeAddress,
  freezeData,
  guardContracts,
}: IManageDAOMenu) {
  const { push } = useRouter();
  const currentTime = BigNumber.from(useBlockTimestamp());
  const { handleClawBack } = useClawBack({
    parentAddress,
    childSafeAddress: safeAddress,
  });

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => push(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };
    if (
      freezeData &&
      freezeData.freezeProposalCreatedTime &&
      freezeData.freezeProposalPeriod &&
      freezeData.freezePeriod &&
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
      freezeData.freezeProposalCreatedTime &&
      freezeData.freezePeriod &&
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
  }, [safeAddress, push, guardContracts, handleClawBack, freezeData, currentTime]);

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
