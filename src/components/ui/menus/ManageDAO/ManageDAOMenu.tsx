import { Icon, IconButton } from '@chakra-ui/react';
import { ERC20FreezeVoting, MultisigFreezeVoting } from '@fractal-framework/fractal-contracts';
import { GearFine } from '@phosphor-icons/react';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address, getAddress } from 'viem';
import { DAO_ROUTES } from '../../../../constants/routes';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useUserERC721VotingTokens from '../../../../hooks/DAO/proposal/useUserERC721VotingTokens';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useSafeContracts from '../../../../hooks/safe/useSafeContracts';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useMasterCopy } from '../../../../hooks/utils/useMasterCopy';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  FractalGuardContracts,
  FractalNode,
  FreezeGuard,
  GovernanceType,
  FreezeVotingType,
} from '../../../../types';
import { getAzoriusModuleFromModules } from '../../../../utils';
import { SENTINEL_MODULE } from '../../../../utils/address';
import { ModalType } from '../../modals/ModalProvider';
import { useFractalModal } from '../../modals/useFractalModal';
import { OptionMenu } from '../OptionMenu';

interface IManageDAOMenu {
  parentAddress: Address | null;
  fractalNode: FractalNode;
  freezeGuard: FreezeGuard;
  guardContracts: FractalGuardContracts;
}

/**
 * The dropdown for managing a DAO.
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
  const [governanceType, setGovernanceType] = useState(GovernanceType.MULTISIG);
  const {
    node: { safe },
    governance: { type },
  } = useFractal();
  const baseContracts = useSafeContracts();
  const currentTime = BigInt(useBlockTimestamp());
  const navigate = useNavigate();
  const safeAddress = fractalNode.daoAddress;
  const { getZodiacModuleProxyMasterCopyData } = useMasterCopy();
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(safeAddress, undefined, false);
  const { handleClawBack } = useClawBack({
    parentAddress,
    childSafeInfo: fractalNode,
  });

  useEffect(() => {
    const loadGovernanceType = async () => {
      if (safe && safe.address && safe.address === safeAddress && type) {
        // Since safe.address (global scope DAO address) and safeAddress(Node provided to this component via props)
        // are the same - we can simply grab governance type from global scope and avoid double-fetching
        setGovernanceType(type);
      } else {
        if (baseContracts) {
          let result = GovernanceType.MULTISIG;
          const azoriusModule = getAzoriusModuleFromModules(fractalNode.fractalModules);
          const { fractalAzoriusMasterCopyContract } = baseContracts;
          if (!!azoriusModule) {
            const azoriusContract = {
              asProvider: fractalAzoriusMasterCopyContract.asProvider.attach(
                azoriusModule.moduleAddress,
              ),
              asSigner: fractalAzoriusMasterCopyContract.asSigner.attach(
                azoriusModule.moduleAddress,
              ),
            };

            // @dev assumes the first strategy is the voting contract
            const votingContractAddress = (
              await azoriusContract.asProvider.getStrategies(SENTINEL_MODULE, 0)
            )[1];
            const masterCopyData = await getZodiacModuleProxyMasterCopyData(
              getAddress(votingContractAddress),
            );

            if (masterCopyData.isOzLinearVoting) {
              result = GovernanceType.AZORIUS_ERC20;
            } else if (masterCopyData.isOzLinearVotingERC721) {
              result = GovernanceType.AZORIUS_ERC721;
            }
          }

          setGovernanceType(result);
        }
      }
    };

    loadGovernanceType();
  }, [fractalNode, safe, safeAddress, type, getZodiacModuleProxyMasterCopyData, baseContracts]);
  const { addressPrefix } = useNetworkConfig();

  const handleNavigateToSettings = useCallback(() => {
    if (safeAddress) {
      navigate(DAO_ROUTES.settings.relative(addressPrefix, safeAddress));
    }
  }, [navigate, addressPrefix, safeAddress]);

  const handleModifyGovernance = useFractalModal(ModalType.CONFIRM_MODIFY_GOVERNANCE);

  const freezeOption = useMemo(
    () => ({
      optionKey: 'optionInitiateFreeze',
      onClick: () => {
        const freezeVotingContract =
          baseContracts!.freezeMultisigVotingMasterCopyContract.asSigner.attach(
            guardContracts!.freezeVotingContractAddress!,
          );
        const freezeVotingType = guardContracts!.freezeVotingType;
        if (freezeVotingContract) {
          if (
            freezeVotingType === FreezeVotingType.MULTISIG ||
            freezeVotingType === FreezeVotingType.ERC20
          ) {
            return (
              freezeVotingContract as ERC20FreezeVoting | MultisigFreezeVoting
            ).castFreezeVote();
          } else if (freezeVotingType === FreezeVotingType.ERC721) {
            getUserERC721VotingTokens(parentAddress, undefined).then(tokensInfo => {
              const freezeERC721VotingContract =
                baseContracts!.freezeERC721VotingMasterCopyContract.asSigner.attach(
                  guardContracts!.freezeVotingContractAddress!,
                );
              return freezeERC721VotingContract!['castFreezeVote(address[],uint256[])'](
                tokensInfo.totalVotingTokenAddresses,
                tokensInfo.totalVotingTokenIds,
              );
            });
          }
        }
      },
    }),
    [baseContracts, guardContracts, getUserERC721VotingTokens, parentAddress],
  );

  const options = useMemo(() => {
    const createSubDAOOption = {
      optionKey: 'optionCreateSubDAO',

      onClick: () => {
        if (safeAddress) {
          navigate(DAO_ROUTES.newSubDao.relative(addressPrefix, safeAddress));
        }
      },
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
      freezeGuard.freezeProposalCreatedTime &&
      freezeGuard.freezeProposalPeriod &&
      freezeGuard.freezePeriod &&
      !isWithinFreezeProposalPeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezeProposalPeriod,
        currentTime,
      ) &&
      !isWithinFreezePeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezePeriod,
        currentTime,
      ) &&
      freezeGuard.userHasVotes
    ) {
      if (governanceType === GovernanceType.MULTISIG) {
        return [createSubDAOOption, freezeOption, modifyGovernanceOption, settingsOption];
      } else {
        return [createSubDAOOption, freezeOption, settingsOption];
      }
    } else if (
      freezeGuard.freezeProposalCreatedTime &&
      freezeGuard.freezePeriod &&
      isWithinFreezePeriod(
        freezeGuard.freezeProposalCreatedTime,
        freezeGuard.freezePeriod,
        currentTime,
      ) &&
      freezeGuard.isFrozen &&
      freezeGuard.userHasVotes
    ) {
      return [clawBackOption, settingsOption];
    } else {
      const optionsArr = [];
      if (canUserCreateProposal) {
        optionsArr.push(createSubDAOOption);
        if (governanceType === GovernanceType.MULTISIG) {
          optionsArr.push(modifyGovernanceOption);
        }
      }
      optionsArr.push(settingsOption);
      return optionsArr;
    }
  }, [
    freezeGuard,
    currentTime,
    navigate,
    safeAddress,
    governanceType,
    handleClawBack,
    canUserCreateProposal,
    handleModifyGovernance,
    handleNavigateToSettings,
    addressPrefix,
    freezeOption,
  ]);

  return (
    <OptionMenu
      trigger={
        <Icon
          as={GearFine}
          boxSize="1.25rem"
        />
      }
      titleKey={canUserCreateProposal ? 'titleManageDAO' : 'titleViewDAODetails'}
      options={options}
      namespace="menu"
      buttonAs={IconButton}
      buttonProps={{
        variant: 'tertiary',
        p: '0.25rem',
        h: 'fit-content',
        sx: {
          span: {
            h: '1.25rem',
          },
        },
      }}
    />
  );
}
