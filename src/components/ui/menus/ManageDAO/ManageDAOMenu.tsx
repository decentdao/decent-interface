import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { DAO_ROUTES } from '../../../../constants/routes';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../../../providers/App/AppProvider';
import { FractalGuardContracts, FreezeGuard, GovernanceModuleType } from '../../../../types';
import { OptionMenu } from '../OptionMenu';

interface IManageDAOMenu {
  parentAddress?: string | null;
  safeAddress: string;
  freezeGuard?: FreezeGuard;
  guardContracts: FractalGuardContracts;
}

export function ManageDAOMenu({
  parentAddress,
  safeAddress,
  freezeGuard,
  guardContracts,
}: IManageDAOMenu) {
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const { push } = useRouter();
  const currentTime = BigNumber.from(useBlockTimestamp());
  const { getCanUserCreateProposal } = useSubmitProposal();
  const { handleClawBack } = useClawBack({
    parentAddress,
    childSafeAddress: safeAddress,
  });
  const {
    governance: { type },
  } = useFractal();

  useEffect(() => {
    const verifyUserCanCreateProposal = async () => {
      setCanUserCreateProposal(await getCanUserCreateProposal(safeAddress));
    };

    verifyUserCanCreateProposal();
  }, [getCanUserCreateProposal, safeAddress]);

  const handleNavigateToManageSigners = useMemo(
    () => () => push(DAO_ROUTES.manageSigners.relative(safeAddress)),
    [push, safeAddress]
  );

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => push(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };

    const manageSignersOption = {
      optionKey: 'optionManageSigners',
      onClick: handleNavigateToManageSigners,
    };

    const viewSignersOption = {
      optionKey: 'optionViewSigners',
      onClick: handleNavigateToManageSigners,
    };
    if (
      freezeGuard &&
      freezeGuard.freezeProposalCreatedTime &&
      freezeGuard.freezeProposalPeriod &&
      freezeGuard.freezePeriod &&
      !isWithinFreezeProposalPeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezeProposalPeriod,
        currentTime
      ) &&
      !isWithinFreezePeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezePeriod,
        currentTime
      ) &&
      freezeGuard.userHasVotes
    ) {
      const freezeOption = {
        optionKey: 'optionInitiateFreeze',
        onClick: () => guardContracts.freezeVotingContract?.asSigner.castFreezeVote(),
      };
      if (type === GovernanceModuleType.MULTISIG) {
        return [createSubDAOOption, manageSignersOption, freezeOption];
      } else {
        return [createSubDAOOption, freezeOption];
      }
    } else if (
      freezeGuard &&
      freezeGuard.freezeProposalCreatedTime &&
      freezeGuard.freezePeriod &&
      isWithinFreezePeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezePeriod,
        currentTime
      ) &&
      freezeGuard.isFrozen &&
      freezeGuard.userHasVotes
    ) {
      const clawBackOption = {
        optionKey: 'optionInitiateClawback',
        onClick: handleClawBack,
      };

      return [clawBackOption];
    } else {
      if (type === GovernanceModuleType.MULTISIG && canUserCreateProposal) {
        return [createSubDAOOption, manageSignersOption];
      } else if (type === GovernanceModuleType.MULTISIG) {
        return [viewSignersOption];
      } else {
        return [createSubDAOOption];
      }
    }
  }, [
    freezeGuard,
    currentTime,
    push,
    safeAddress,
    type,
    guardContracts.freezeVotingContract?.asSigner,
    handleClawBack,
    canUserCreateProposal,
    handleNavigateToManageSigners,
  ]);

  return (
    <OptionMenu
      trigger={
        <VEllipsis
          boxSize="1.5rem"
          mt="0.25rem"
        />
      }
      titleKey={canUserCreateProposal ? 'titleManageDAO' : 'titleViewDAODetails'}
      options={options}
      namespace="menu"
    />
  );
}
