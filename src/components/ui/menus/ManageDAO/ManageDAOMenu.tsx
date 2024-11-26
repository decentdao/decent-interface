import { Icon, IconButton } from '@chakra-ui/react';
import { abis } from '@fractal-framework/fractal-contracts';
import { GearFine } from '@phosphor-icons/react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContract } from 'viem';
import { useWalletClient } from 'wagmi';
import { DAO_ROUTES } from '../../../../constants/routes';
import {
  isWithinFreezePeriod,
  isWithinFreezeProposalPeriod,
} from '../../../../helpers/freezePeriodHelpers';
import useUserERC721VotingTokens from '../../../../hooks/DAO/proposal/useUserERC721VotingTokens';
import useClawBack from '../../../../hooks/DAO/useClawBack';
import useBlockTimestamp from '../../../../hooks/utils/useBlockTimestamp';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { FractalModuleType, FreezeVotingType, GovernanceType } from '../../../../types';
import { ModalType } from '../../modals/ModalProvider';
import { useDecentModal } from '../../modals/useDecentModal';
import { OptionMenu } from '../OptionMenu';

export function ManageDAOMenu() {
  const {
    governance: { type },
    guard,
    guardContracts,
  } = useFractal();
  const node = useDaoInfoStore();
  const currentTime = BigInt(useBlockTimestamp());
  const navigate = useNavigate();
  const safeAddress = node.safe?.address;
  const { canUserCreateProposal } = useCanUserCreateProposal();
  const { getUserERC721VotingTokens } = useUserERC721VotingTokens(safeAddress ?? null, null, false);
  const { handleClawBack } = useClawBack({
    parentAddress: node.nodeHierarchy.parentAddress,
    childSafeInfo: node,
  });

  const { addressPrefix } = useNetworkConfig();

  const handleNavigateToSettings = useCallback(() => {
    if (safeAddress) {
      navigate(DAO_ROUTES.settings.relative(addressPrefix, safeAddress));
    }
  }, [navigate, addressPrefix, safeAddress]);

  const handleModifyGovernance = useDecentModal(ModalType.CONFIRM_MODIFY_GOVERNANCE);

  const { data: walletClient } = useWalletClient();

  const freezeOption = useMemo(
    () => ({
      optionKey: 'optionInitiateFreeze',
      onClick: () => {
        const freezeVotingType = guardContracts.freezeVotingType;

        if (freezeVotingType === FreezeVotingType.MULTISIG) {
          if (!guardContracts.freezeVotingContractAddress) {
            throw new Error('freeze voting contract address not set');
          }
          if (!walletClient) {
            throw new Error('wallet client not set');
          }

          const freezeVotingContract = getContract({
            abi: abis.MultisigFreezeVoting,
            address: guardContracts.freezeVotingContractAddress,
            client: walletClient,
          });
          return freezeVotingContract.write.castFreezeVote();
        } else if (freezeVotingType === FreezeVotingType.ERC20) {
          if (!guardContracts.freezeVotingContractAddress) {
            throw new Error('freeze voting contract address not set');
          }
          if (!walletClient) {
            throw new Error('wallet client not set');
          }
          const contract = getContract({
            abi: abis.ERC20FreezeVoting,
            address: guardContracts.freezeVotingContractAddress,
            client: walletClient,
          });
          return contract.write.castFreezeVote();
        } else if (freezeVotingType === FreezeVotingType.ERC721) {
          getUserERC721VotingTokens(node.nodeHierarchy.parentAddress, null).then(tokensInfo => {
            if (!guardContracts.freezeVotingContractAddress) {
              throw new Error('freeze voting contract address not set');
            }
            if (!walletClient) {
              throw new Error('wallet client not set');
            }
            const freezeERC721VotingContract = getContract({
              abi: abis.ERC721FreezeVoting,
              address: guardContracts.freezeVotingContractAddress,
              client: walletClient,
            });
            return freezeERC721VotingContract.write.castFreezeVote([
              tokensInfo.totalVotingTokenAddresses,
              tokensInfo.totalVotingTokenIds.map(i => BigInt(i)),
            ]);
          });
        }
      },
    }),
    [getUserERC721VotingTokens, guardContracts, node.nodeHierarchy.parentAddress, walletClient],
  );

  const options = useMemo(() => {
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
      guard.freezeProposalCreatedTime !== null &&
      guard.freezeProposalPeriod !== null &&
      guard.freezePeriod !== null &&
      !isWithinFreezeProposalPeriod(
        guard.freezeProposalCreatedTime,
        guard.freezeProposalPeriod,
        currentTime,
      ) &&
      !isWithinFreezePeriod(guard.freezeProposalCreatedTime, guard.freezePeriod, currentTime) &&
      guard.userHasVotes
    ) {
      if (type === GovernanceType.MULTISIG) {
        return [freezeOption, modifyGovernanceOption, settingsOption];
      } else {
        return [freezeOption, settingsOption];
      }
    } else if (
      guard.freezeProposalCreatedTime !== null &&
      guard.freezePeriod !== null &&
      isWithinFreezePeriod(guard.freezeProposalCreatedTime, guard.freezePeriod, currentTime) &&
      guard.isFrozen &&
      guard.userHasVotes
    ) {
      const fractalModule = node.fractalModules.find(
        module => module.moduleType === FractalModuleType.FRACTAL,
      );
      if (fractalModule) {
        return [clawBackOption, settingsOption];
      } else {
        return [settingsOption];
      }
    } else {
      const optionsArr = [];
      if (canUserCreateProposal) {
        if (type === GovernanceType.MULTISIG) {
          optionsArr.push(modifyGovernanceOption);
        }
      }
      optionsArr.push(settingsOption);
      return optionsArr;
    }
  }, [
    guard,
    currentTime,
    type,
    handleClawBack,
    canUserCreateProposal,
    handleModifyGovernance,
    handleNavigateToSettings,
    freezeOption,
    node.fractalModules,
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
