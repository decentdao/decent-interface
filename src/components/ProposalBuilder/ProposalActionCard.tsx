import { Button, Card, Flex, Icon, Text } from '@chakra-ui/react';
import { ArrowsDownUp, Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { formatUnits, getAddress, zeroAddress } from 'viem';
import { useGetAccountName } from '../../hooks/utils/useGetAccountName';
import { useFractal } from '../../providers/App/AppProvider';
import { useProposalActionsStore } from '../../store/actions/useProposalActionsStore';
import { CreateProposalAction, ProposalActionType } from '../../types/proposalBuilder';
import { SendAssetsData } from '../ui/modals/SendAssetsModal';

export function SendAssetsAction({
  index,
  action,
  onRemove,
}: {
  index: number;
  action: SendAssetsData;
  onRemove: (index: number) => void;
}) {
  const { t } = useTranslation('common');
  const { displayName } = useGetAccountName(action.destinationAddress);

  return (
    <Card my="0.5rem">
      <Flex justifyContent="space-between">
        <Flex
          alignItems="center"
          gap="0.5rem"
        >
          <Icon
            as={ArrowsDownUp}
            w="1.5rem"
            h="1.5rem"
            color="lilac-0"
          />
          <Text>{t('transfer')}</Text>
          <Text color="lilac-0">
            {formatUnits(action.transferAmount, action.asset.decimals)} {action.asset.symbol}
          </Text>
          <Text>{t('to').toLowerCase()}</Text>
          <Text color="lilac-0">{displayName}</Text>
        </Flex>
        <Button
          color="red-0"
          variant="tertiary"
          size="sm"
          onClick={() => {
            onRemove(index);
          }}
        >
          <Icon as={Trash} />
        </Button>
      </Flex>
    </Card>
  );
}

export function ProposalActionCard({
  action,
  index,
}: {
  action: CreateProposalAction;
  index: number;
}) {
  const { removeAction } = useProposalActionsStore();
  const {
    treasury: { assetsFungible },
  } = useFractal();
  if (action.actionType === ProposalActionType.TRANSFER) {
    const destinationAddress = action.transactions[0].parameters[0].value
      ? getAddress(action.transactions[0].parameters[0].value)
      : zeroAddress;
    const transferAmount = BigInt(action.transactions[0].parameters[1].value || '0');
    if (!destinationAddress || !transferAmount) {
      return null;
    }

    const actionAsset = assetsFungible.find(
      asset => getAddress(asset.tokenAddress) === destinationAddress,
    );

    if (!actionAsset) {
      return null;
    }
    return (
      <SendAssetsAction
        key={index}
        index={index}
        action={{
          destinationAddress,
          transferAmount,
          asset: actionAsset,
          nonceInput: undefined,
        }}
        onRemove={removeAction}
      />
    );
  }
  return <></>;
}
