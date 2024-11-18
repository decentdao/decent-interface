import { Button, Flex, Text } from '@chakra-ui/react';
import { WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DAO_ROUTES } from '../../../constants/routes';
import useVotingStrategiesAddresses from '../../../hooks/utils/useVotingStrategiesAddresses';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useProposalActionsStore } from '../../../store/actions/useProposalActionsStore';
import { useDaoInfoStore } from '../../../store/daoInfo/useDaoInfoStore';
import { AzoriusGovernance, CreateProposalTransaction, ProposalActionType } from '../../../types';
import { SENTINEL_MODULE } from '../../../utils/address';
import { SafePermissionsStrategyAction } from '../../SafeSettings/SafePermissionsStrategyAction';

export function ConfirmDeleteStrategyModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const { addressPrefix } = useNetworkConfig();
  const { governance, governanceContracts } = useFractal();
  const { safe } = useDaoInfoStore();
  const { addAction } = useProposalActionsStore();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { getVotingStrategies } = useVotingStrategiesAddresses();

  const handleDeleteStrategy = async () => {
    if (!safe || !governanceContracts.moduleAzoriusAddress) {
      return;
    }

    if (
      !governanceContracts.linearVotingErc20WithHatsWhitelistingAddress &&
      !governanceContracts.linearVotingErc721WithHatsWhitelistingAddress
    ) {
      toast.error(t('cannotDeleteStrategy'));
      onClose();
      return;
    }

    let transaction: CreateProposalTransaction;
    if (governanceContracts.linearVotingErc20Address) {
      const strategies = await getVotingStrategies();

      if (!strategies) {
        throw new Error('No strategies found');
      }

      // Find the previous strategy for the one you want to disable
      const strategyToDisable = governanceContracts.linearVotingErc20Address;
      let prevStrategy = SENTINEL_MODULE;
      for (let i = 0; i < strategies.length; i++) {
        if (strategies[i].strategyAddress === strategyToDisable) {
          break;
        }
        prevStrategy = strategies[i].strategyAddress;
      }
      transaction = {
        targetAddress: governanceContracts.moduleAzoriusAddress,
        ethValue: {
          bigintValue: 0n,
          value: '0',
        },
        functionName: 'disableStrategy',
        parameters: [
          {
            signature: 'address',
            value: prevStrategy,
          },
          {
            signature: 'address',
            value: strategyToDisable,
          },
        ],
      };
    } else if (governanceContracts.linearVotingErc721Address) {
      const strategies = await getVotingStrategies();

      if (!strategies) {
        throw new Error('No strategies found');
      }

      // Find the previous strategy for the one you want to disable
      const strategyToDisable = governanceContracts.linearVotingErc721Address;
      let prevStrategy = SENTINEL_MODULE;
      for (let i = 0; i < strategies.length; i++) {
        if (strategies[i].strategyAddress === strategyToDisable) {
          break;
        }
        prevStrategy = strategies[i].strategyAddress;
      }
      transaction = {
        targetAddress: governanceContracts.moduleAzoriusAddress,
        ethValue: {
          bigintValue: 0n,
          value: '0',
        },
        functionName: 'disableStrategy',
        parameters: [
          {
            signature: 'address',
            value: prevStrategy,
          },
          {
            signature: 'address',
            value: strategyToDisable,
          },
        ],
      };
    } else {
      throw new Error('No linear voting contract found');
    }

    addAction({
      actionType: ProposalActionType.DELETE,
      content: (
        <SafePermissionsStrategyAction
          actionType={ProposalActionType.DELETE}
          proposerThreshold={{
            value: azoriusGovernance.votingStrategy?.proposerThreshold?.formatted || '0',
            bigintValue: azoriusGovernance.votingStrategy?.proposerThreshold?.value,
          }}
        />
      ),
      transactions: [transaction],
    });
    navigate(DAO_ROUTES.proposalWithActionsNew.relative(addressPrefix, safe.address));
    onClose();
  };

  return (
    <Flex
      flexDirection="column"
      gap={6}
    >
      <Flex
        flexDirection="column"
        gap={4}
        justifyContent="center"
        alignItems="center"
      >
        <WarningCircle size={40} />
        <Text textStyle="display-xl">{t('areYouSure')}</Text>
      </Flex>
      <Flex
        flexDirection="column"
        gap={2}
      >
        <Button
          variant="primary"
          onClick={onClose}
        >
          {t('nevermind')}
        </Button>
        <Button
          variant="secondary"
          color="red-1"
          borderColor="red-1"
          _hover={{ color: 'red-0', borderColor: 'red-0' }}
          onClick={handleDeleteStrategy}
        >
          {t('deletePermission')}
        </Button>
      </Flex>
    </Flex>
  );
}
