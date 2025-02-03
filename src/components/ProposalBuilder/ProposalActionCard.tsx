import { Button, Flex, Icon, IconButton, Text } from '@chakra-ui/react';
import { ArrowsDownUp, CheckSquare, Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { formatUnits, getAddress, isAddress } from 'viem';
import PencilWithLineIcon from '../../assets/theme/custom/icons/PencilWithLineIcon';
import { useFractal } from '../../providers/App/AppProvider';
import { useProposalActionsStore } from '../../store/actions/useProposalActionsStore';
import { CreateProposalAction, ProposalActionType } from '../../types/proposalBuilder';
import { MOCK_MORALIS_ETH_ADDRESS } from '../../utils/address';
import { Card } from '../ui/cards/Card';
import { SendAssetsActionCard } from '../ui/cards/SendAssetsActionCard';

function SendAssetsAction({
  action,
  onRemove,
}: {
  action: CreateProposalAction;
  onRemove: () => void;
}) {
  const {
    treasury: { assetsFungible },
  } = useFractal();

  const isNativeAsset = action.transactions[0].parameters.length === 0;

  const destinationAddress = isNativeAsset
    ? action.transactions[0].targetAddress
    : action.transactions[0].parameters[0].value;

  if (!destinationAddress || !isAddress(destinationAddress)) {
    return null;
  }

  let transferAmount: bigint;

  if (isNativeAsset && action.transactions[0].ethValue.bigintValue !== undefined) {
    transferAmount = action.transactions[0].ethValue.bigintValue;
  } else if (action.transactions[0].parameters[1].value !== undefined) {
    transferAmount = BigInt(action.transactions[0].parameters[1].value);
  } else {
    return null;
  }

  const transferringAssetAddress = isNativeAsset
    ? MOCK_MORALIS_ETH_ADDRESS
    : getAddress(action.transactions[0].targetAddress);

  const asset = assetsFungible.find(a => getAddress(a.tokenAddress) === transferringAssetAddress);

  if (!asset) {
    return null;
  }

  return (
    <SendAssetsActionCard
      action={{
        destinationAddress,
        transferAmount,
        asset,
        nonceInput: undefined,
      }}
      onRemove={onRemove}
    />
  );
}

export function AirdropAction({
  action,
  onRemove,
}: {
  action: CreateProposalAction;
  onRemove: () => void;
}) {
  const { t } = useTranslation('common');
  const {
    treasury: { assetsFungible },
  } = useFractal();
  const totalAmountString = action.transactions[1].parameters[2].value?.slice(1, -1);
  const totalAmount = BigInt(
    totalAmountString?.split(',').reduce((acc, curr) => acc + BigInt(curr), 0n) || '0',
  );
  const recipientsCount = action.transactions[1].parameters[1].value?.split(',').length || 0;

  // First transaction in the airdrop proposal will be approval transaction, which is called on the token
  // Thus we can find the asset by looking at the target address of the first transaction

  const actionAsset = assetsFungible.find(
    asset => getAddress(asset.tokenAddress) === getAddress(action.transactions[0].targetAddress),
  );

  if (!actionAsset) {
    return null;
  }
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
          <Text>{t('airdrop')}</Text>
          <Text color="lilac-0">
            {formatUnits(totalAmount, actionAsset.decimals)} {actionAsset.symbol}
          </Text>
          <Text>{t('to').toLowerCase()}</Text>
          <Text color="lilac-0">
            {recipientsCount} {t('recipients')}
          </Text>
        </Flex>
        <Button
          color="red-0"
          variant="tertiary"
          size="sm"
          onClick={onRemove}
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
  canBeDeleted,
}: {
  action: CreateProposalAction;
  index: number;
  canBeDeleted: boolean;
}) {
  const { removeAction } = useProposalActionsStore();
  if (action.actionType === ProposalActionType.TRANSFER) {
    return (
      <SendAssetsAction
        action={action}
        onRemove={() => removeAction(index)}
      />
    );
  } else if (action.actionType === ProposalActionType.AIRDROP) {
    return (
      <AirdropAction
        action={action}
        onRemove={() => removeAction(index)}
      />
    );
  }

  const isAddAction = action.actionType === ProposalActionType.ADD;
  const isEditAction = action.actionType === ProposalActionType.EDIT;
  const isDeleteAction = action.actionType === ProposalActionType.DELETE;

  return (
    <Flex
      gap={4}
      alignItems="center"
    >
      <Card
        backgroundColor={
          isAddAction || isEditAction ? 'neutral-2' : isDeleteAction ? 'red-2' : 'neutral-3'
        }
      >
        <Flex
          gap={2}
          alignItems="center"
        >
          <Icon
            as={isAddAction ? CheckSquare : isEditAction ? PencilWithLineIcon : Trash}
            color={isEditAction || isAddAction ? 'neutral-7' : 'red-1'}
          />
          {action.content}
        </Flex>
      </Card>
      {canBeDeleted && (
        <IconButton
          aria-label="Remove action"
          icon={<Trash />}
          variant="ghost"
          size="icon-sm"
          color="red-1"
          onClick={() => removeAction(index)}
        />
      )}
    </Flex>
  );
}
