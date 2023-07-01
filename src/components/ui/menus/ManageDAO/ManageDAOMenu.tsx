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
import {
  FractalGuardContracts,
  FractalModuleType,
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
  fractalNode?: FractalNode;
  freezeGuard?: FreezeGuard;
  guardContracts?: FractalGuardContracts;
  governanceType?: GovernanceModuleType;
}

/**
 * The dropdown (vertical ellipses) for managing a DAO.
 *
 * It is important to note that you cannot rely on the useFractal()
 * hook to supply information to this menu, as it is used within the
 * DAO hierarchy, for multiple DAO contexts.
 *
 * All info for this menu should be supplied in the constructor.
 */
export function ManageDAOMenu({
  parentAddress,
  freezeGuard,
  guardContracts,
  fractalNode,
}: IManageDAOMenu) {
  const [canUserCreateProposal, setCanUserCreateProposal] = useState(false);
  const { getCanUserCreateProposal } = useSubmitProposal();
  const currentTime = BigNumber.from(useBlockTimestamp());
  const { push } = useRouter();

  const { address: account } = useAccount();
  const { handleClawBack } = useClawBack({
    parentAddress,
    childSafeInfo: fractalNode,
  });
  const safeAddress = fractalNode?.daoAddress;

  let governanceType: GovernanceModuleType = GovernanceModuleType.MULTISIG;
  fractalNode?.fractalModules.forEach(_module => {
    if (_module.moduleType === FractalModuleType.AZORIUS) {
      governanceType = GovernanceModuleType.AZORIUS;
    }
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

  const handleNavigateToSettings = useMemo(
    () => () => push(DAO_ROUTES.settings.relative(safeAddress)),
    [push, safeAddress]
  );

  const handleModifyGovernance = useFractalModal(ModalType.CONFIRM_MODIFY_GOVERNANCE);

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',
      onClick: () => push(DAO_ROUTES.newSubDao.relative(safeAddress)),
    };

    const freezeOption = {
      optionKey: 'optionInitiateFreeze',
      onClick: () => guardContracts?.freezeVotingContract?.asSigner.castFreezeVote(),
    };

    const clawBackOption = {
      optionKey: 'optionInitiateClawback',
      onClick: handleClawBack,
    };

    const modifyGovernanceOption = {
      optionKey: 'optionModifyGovernance',
      onClick: handleModifyGovernance,
    };

    const settingsOption = {
      optionKey: 'optionSettings',
      onClick: handleNavigateToSettings,
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
      if (governanceType === GovernanceModuleType.MULTISIG) {
        return [createSubDAOOption, freezeOption, modifyGovernanceOption, settingsOption];
      } else {
        return [createSubDAOOption, freezeOption, settingsOption];
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
      return [clawBackOption, settingsOption];
    } else {
      if (governanceType === GovernanceModuleType.MULTISIG && canUserCreateProposal) {
        return [createSubDAOOption, modifyGovernanceOption, settingsOption];
      } else if (governanceType === GovernanceModuleType.MULTISIG) {
        return [settingsOption];
      } else {
        return [createSubDAOOption, settingsOption];
      }
    }
  }, [
    freezeGuard,
    currentTime,
    push,
    safeAddress,
    governanceType,
    guardContracts?.freezeVotingContract?.asSigner,
    handleClawBack,
    canUserCreateProposal,
    handleModifyGovernance,
    handleNavigateToSettings,
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
