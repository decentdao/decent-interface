import { VEllipsis } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { DAO_ROUTES } from '../../../../constants/routes';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useSubmitProposal from '../../../../hooks/DAO/proposal/useSubmitProposal';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { useFractal } from '../../../../providers/App/AppProvider';
import {
  FractalGuardContracts,
  FractalNode,
  FreezeGuard,
  GovernanceModuleType,
} from '../../../../types';
import { getAzoriusModuleFromModules } from '../../../../utils';
import { ModalType } from '../../modals/ModalProvider';
import { useFractalModal } from '../../modals/useFractalModal';
import { OptionMenu } from '../OptionMenu';

interface IManageDAOMenu {
  parentAddress?: string | null;
  safeAddress: string;
  freezeGuard?: FreezeGuard;
  fractalNode?: FractalNode;
  guardContracts: FractalGuardContracts;
}

export function ManageDAOMenu({
  parentAddress,
  safeAddress,
  freezeGuard,
  guardContracts,
  fractalNode,
}: IManageDAOMenu) {
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const { push } = useRouter();
  const currentTime = BigNumber.from(useBlockTimestamp());
  const { getCanUserCreateProposal } = useSubmitProposal();
  const {
    governance: { type },
  } = useFractal();

  const { address: account } = useAccount();
  const { handleClawBack } = useClawBack({
    parentAddress,
    childSafeInfo: fractalNode,
  });

  useEffect(() => {
    if (!fractalNode) {
      return;
    }
    const azoriusModule = getAzoriusModuleFromModules(fractalNode.fractalModules);
    if (azoriusModule) {
      setCanUserCreateProposal(true);
      return;
    }
    if (fractalNode.safe && account) {
      setCanUserCreateProposal(fractalNode.safe.owners.includes(account!));
    }
  }, [getCanUserCreateProposal, fractalNode, account]);

  const handleNavigateToManageSigners = useMemo(
    () => () => push(DAO_ROUTES.manageSigners.relative(safeAddress)),
    [push, safeAddress]
  );

  const handleModifyGovernance = useFractalModal(ModalType.CONFIRM_MODIFY_GOVERNANCE);

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

    const freezeOption = {
      optionKey: 'optionInitiateFreeze',
      onClick: () => guardContracts.freezeVotingContract?.asSigner.castFreezeVote(),
    };

    const clawBackOption = {
      optionKey: 'optionInitiateClawback',
      onClick: handleClawBack,
    };

    const modifyGovernanceOption = {
      optionKey: 'optionModifyGovernance',
      onClick: handleModifyGovernance,
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
      if (type === GovernanceModuleType.MULTISIG) {
        return [createSubDAOOption, manageSignersOption, freezeOption, modifyGovernanceOption];
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
      return [clawBackOption];
    } else {
      if (type === GovernanceModuleType.MULTISIG && canUserCreateProposal) {
        return [createSubDAOOption, manageSignersOption, modifyGovernanceOption];
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
    handleModifyGovernance,
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
