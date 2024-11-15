import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import { Coins, WarningCircle } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useProposalActionsStore } from '../../../store/actions/useProposalActionsStore';
import { AzoriusGovernance, CreateProposalTransaction, ProposalActionType } from '../../../types';

export function ConfirmDeleteStrategyModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const { addressPrefix } = useNetworkConfig();
  const {
    governance,
    governanceContracts,
    node: { safe },
  } = useFractal();
  const { addAction } = useProposalActionsStore();

  const azoriusGovernance = governance as AzoriusGovernance;

  const handleDeleteStrategy = () => {
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
            value: governanceContracts.linearVotingErc20Address,
          },
        ],
      };
    } else if (governanceContracts.linearVotingErc721Address) {
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
            value: governanceContracts.linearVotingErc721Address,
          },
        ],
      };
    } else {
      throw new Error('No linear voting contract found');
    }

    addAction({
      actionType: ProposalActionType.DELETE,
      content: (
        <Box width="100%">
          <Text as="span">{t('deletePermission')} </Text>
          <Text
            color="lilac-0"
            as="span"
          >
            {t('createProposals')}
          </Text>
          <Text as="span">{t('editPermissionActionDescription')} </Text>
          <Icon
            as={Coins}
            color="lilac-0"
          />
          <Text as="span">
            {`${azoriusGovernance.votingStrategy?.proposerThreshold?.value} ${t('votingWeightThreshold')}`}{' '}
          </Text>
          <Text as="span">{t('editPermissionActionDescription2')}</Text>
        </Box>
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
