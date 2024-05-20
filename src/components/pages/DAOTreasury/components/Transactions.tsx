import { Box, Button, HStack, Image, Text, Tooltip, Icon, Flex } from '@chakra-ui/react';
import { ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useDateTimeDisplay } from '../../../../helpers/dateTime';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { TransferType, AssetTransfer } from '../../../../types';
import { DisplayAddress } from '../../../ui/links/DisplayAddress';
import EtherscanLink from '../../../ui/links/EtherscanLink';
import {
  TokenEventType,
  TransferDisplayData,
  useFormatTransfers,
} from '../hooks/useFormatTransfers';

function TransferRow({ displayData }: { displayData: TransferDisplayData }) {
  const { t } = useTranslation(['treasury', 'common']);
  const { etherscanBaseURL } = useNetworkConfig();

  return (
    <Box
      minW="595px"
      p="0.25rem"
      _hover={{ cursor: 'pointer', bg: 'white-alpha-04' }}
      onClick={() => window.open(`${etherscanBaseURL}/tx/${displayData.transactionHash}`, '_blank')}
    >
      <HStack gap="1rem">
        <Flex
          minW="135px"
          alignItems="center"
          gap="0.5rem"
        >
          <Icon
            as={displayData.eventType == TokenEventType.WITHDRAW ? ArrowUp : ArrowDown}
            w="1.25rem"
            h="1.25rem"
            color="neutral-7"
          />
          <Box>
            <Text
              textStyle="label-small"
              color="neutral-7"
            >
              {t(displayData.eventType == TokenEventType.WITHDRAW ? 'labelSent' : 'labelReceived')}
            </Text>
            <Text>{useDateTimeDisplay(new Date(displayData.executionDate))}</Text>
          </Box>
        </Flex>
        <HStack w="30%">
          <Image
            src={displayData.image}
            fallbackSrc={
              displayData.transferType === TransferType.ERC721_TRANSFER
                ? '/images/nft-image-default.svg'
                : '/images/coin-icon-default.svg'
            }
            alt={displayData.assetDisplay}
            w="1.25rem"
            h="1.25rem"
          />
          <Tooltip
            label={
              displayData.transferType === TransferType.ERC721_TRANSFER
                ? undefined
                : displayData.fullCoinTotal
            }
            placement="top-start"
          >
            <Text
              maxWidth="15rem"
              noOfLines={1}
              data-testid={
                displayData.transferType === TransferType.ERC721_TRANSFER
                  ? 'link-token-name'
                  : 'link-token-amount'
              }
            >
              {(displayData.eventType == TokenEventType.WITHDRAW ? '- ' : '+ ') +
                displayData.assetDisplay}
            </Text>
          </Tooltip>
        </HStack>
        <HStack
          w="40%"
          justifyContent="flex-end"
        >
          <DisplayAddress
            data-testid="link-transfer-address"
            address={displayData.transferAddress}
            textAlign="end"
            onClick={e => e.stopPropagation()}
          />
        </HStack>
      </HStack>
    </Box>
  );
}

function EmptyTransactions() {
  const { t } = useTranslation('treasury');
  return (
    <Text
      textStyle="body-base-strong"
      color="neutral-7"
      data-testid="text-empty-transactions"
      marginTop="1rem"
      align="center"
      px={{ base: '1rem', lg: '1.5rem' }}
    >
      {t('textEmptyTransactions')}
    </Text>
  );
}

export function Transactions({ shownTransactions }: { shownTransactions: number }) {
  const {
    node: { daoAddress },
    treasury: { transfers },
  } = useFractal();

  const displayData: TransferDisplayData[] = useFormatTransfers(
    transfers ? (transfers.results as AssetTransfer[]) : [],
    daoAddress!,
  );

  if (!transfers || transfers.results.length === 0) return <EmptyTransactions />;

  return (
    <Box px={{ base: '1rem', lg: '1.5rem' }}>
      {displayData.slice(0, shownTransactions - 1).map((transfer, i) => (
        <TransferRow
          key={i}
          displayData={transfer}
        />
      ))}
    </Box>
  );
}

export function PaginationButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation('treasury');
  return (
    <Flex
      w="full"
      mt="1rem"
      justifyContent="center"
    >
      {/* @todo - this should be <Button variant="button-pill" /> from theme, same as CeleryButtonWithIcon */}
      <Button
        h="1.75rem"
        py="0.25rem"
        px="0.75rem"
        borderRadius="full"
        bg="neutral-3"
        color="lilac-0"
        onClick={onClick}
      >
        {t('textMoreTransactions')}
      </Button>
    </Flex>
  );
}

export function PaginationCount({
  totalTransfers,
  shownTransactions,
  daoAddress,
}: {
  totalTransfers: number;
  shownTransactions: number;
  daoAddress: string | null;
}) {
  const { t } = useTranslation('treasury');
  if (!totalTransfers || !daoAddress) {
    return null;
  }
  return (
    <Flex gap="0.25rem">
      <Text
        color="neutral-7"
        textStyle="helper-text-base"
      >
        {t('transactionsShownCount', {
          count: totalTransfers > shownTransactions ? shownTransactions : totalTransfers,
        })}
      </Text>
      <EtherscanLink
        type="address"
        value={daoAddress}
        p={0}
        textStyle="helper-text-base"
        outline="unset"
        outlineOffset="unset"
        borderWidth={0}
      >
        {t('transactionsTotalCount', { count: totalTransfers })}
      </EtherscanLink>
    </Flex>
  );
}
