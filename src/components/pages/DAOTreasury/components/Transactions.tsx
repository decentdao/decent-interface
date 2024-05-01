import { Box, HStack, Image, Text, Tooltip, Icon, Flex } from '@chakra-ui/react';
import { ArrowUp, ArrowDown, ArrowUpRight } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useDateTimeDisplay } from '../../../../helpers/dateTime';
import { useFractal } from '../../../../providers/App/AppProvider';
import { TransferType, AssetTransfer } from '../../../../types';
import { DisplayAddress } from '../../../ui/links/DisplayAddress';
import EtherscanLinkAddress from '../../../ui/links/EtherscanLinkAddress';
import EtherscanLinkTransaction from '../../../ui/links/EtherscanLinkTransaction';
import {
  TokenEventType,
  TransferDisplayData,
  useFormatTransfers,
} from '../hooks/useFormatTransfers';

function TransferRow({ displayData }: { displayData: TransferDisplayData }) {
  const { t } = useTranslation(['treasury', 'common']);
  return (
    <Box>
      <HStack
        align="center"
        marginBottom={displayData.isLast ? 0 : '0.5rem'}
      >
        <HStack w="30%">
          <EtherscanLinkTransaction txHash={displayData.transactionHash}>
            <Icon
              as={displayData.eventType == TokenEventType.WITHDRAW ? ArrowUp : ArrowDown}
              w="1.25rem"
              h="1.25rem"
              color="neutral-7"
            />
          </EtherscanLinkTransaction>
          <Box paddingStart="0.5rem">
            <Text
              textStyle="label-small"
              color="neutral-7"
            >
              {t(displayData.eventType == TokenEventType.WITHDRAW ? 'labelSent' : 'labelReceived')}
            </Text>
            <Text>{useDateTimeDisplay(new Date(displayData.executionDate))}</Text>
          </Box>
        </HStack>
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
        <HStack w="40%" justifyContent="flex-end">
          <DisplayAddress
            data-testid="link-transfer-address"
            address={displayData.transferAddress}
            textAlign="end"
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
    >
      {t('textEmptyTransactions')}
    </Text>
  );
}

function MoreTransactions({ address }: { address: string | null }) {
  const { t } = useTranslation('treasury');
  return (
    <Flex
      justifyContent="center"
      mt="1rem"
    >
      <EtherscanLinkAddress
        address={address}
        display="inline-flex"
      >
        {t('textMoreTransactions')} <Icon as={ArrowUpRight} />
      </EtherscanLinkAddress>
    </Flex>
  );
}

export function Transactions() {
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
    <Box>
      {displayData.map((transfer, index) => {
        return (
          <TransferRow
            key={index}
            displayData={transfer}
          />
        );
      })}
      {transfers.next && <MoreTransactions address={daoAddress} />}
    </Box>
  );
}
