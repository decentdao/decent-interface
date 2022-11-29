import { Box, Divider, HStack, Image, Spacer, Text, Tooltip } from '@chakra-ui/react';
import { SquareSolidArrowDown, SquareSolidArrowUp } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import coinDefault from '../../../assets/images/coin-icon-default.svg';
import nftDefault from '../../../assets/images/nft-image-default.svg';
import EtherscanLinkAddress from '../../../components/ui/EtherscanLinkAddress';
import EtherscanTransactionLink from '../../../components/ui/EtherscanTransactionLink';
import { ShortenedAddressLink } from '../../../components/ui/ShortenedAddressLink';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { AssetTransfer, TransferType } from '../../../providers/Fractal/types/treasury';
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
        marginTop="1rem"
        marginBottom={displayData.isLast ? '0rem' : '1rem'}
      >
        <HStack w="33%">
          {displayData.eventType == TokenEventType.WITHDRAW ? (
            <SquareSolidArrowUp
              w="1.5rem"
              h="1.5rem"
              color="grayscale.100"
            />
          ) : (
            <SquareSolidArrowDown
              w="1.5rem"
              h="1.5rem"
              color="#60B55E"
            />
          )}
          <Box paddingStart="0.5rem">
            <Text
              textStyle="text-sm-sans-regular"
              color="grayscale.100"
            >
              {t(displayData.eventType == TokenEventType.WITHDRAW ? 'labelSent' : 'labelReceived')}
            </Text>
            <Text
              textStyle="text-base-sans-regular"
              color="chocolate.200"
            >
              {displayData.dateTimeDisplay}
            </Text>
          </Box>
        </HStack>
        <HStack w="33%">
          <Image
            src={displayData.image}
            fallbackSrc={
              displayData.transferType === TransferType.ERC721_TRANSFER ? nftDefault : coinDefault
            }
            alt={displayData.assetDisplay}
            w="1.5rem"
            h="1.5rem"
          />
          <EtherscanTransactionLink txHash={displayData.transactionHash}>
            <Tooltip
              label={
                displayData.transferType === TransferType.ERC721_TRANSFER
                  ? undefined
                  : displayData.fullCoinTotal
              }
              placement="top-start"
            >
              <Text
                textStyle="text-base-sans-regular"
                color={
                  displayData.eventType === TokenEventType.WITHDRAW ? 'grayscale.100' : '#60B55E'
                }
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
          </EtherscanTransactionLink>
        </HStack>
        <HStack w="33%">
          <Spacer />
          <ShortenedAddressLink
            data-testid="link-transfer-address"
            address={displayData.transferAddress}
          />
        </HStack>
      </HStack>
      {!displayData.isLast && <Divider color="chocolate.700" />}
    </Box>
  );
}

function EmptyTransactions() {
  const { t } = useTranslation('treasury');
  return (
    <Text
      textStyle="text-base-sans-regular"
      color="grayscale.100"
      data-testid="text-empty-transactions"
      marginTop="1rem"
      align="center"
    >
      {t('textEmptyTransactions')}
    </Text>
  );
}

function MoreTransactions({ address }: { address: string | undefined }) {
  const { t } = useTranslation('treasury');
  return (
    <EtherscanLinkAddress address={address}>
      <Text
        textStyle="text-sm-sans-regular"
        color="grayscale.100"
        data-testid="link-more-transactions"
        marginTop="1rem"
        align="center"
      >
        {t('textMoreTransactions')}
      </Text>
    </EtherscanLinkAddress>
  );
}

export function Transactions() {
  const {
    gnosis: { safe },
    treasury: { transfers },
  } = useFractal();

  const displayData: TransferDisplayData[] = useFormatTransfers(
    transfers ? (transfers.results as AssetTransfer[]) : [],
    safe.address!
  );

  if (!transfers || transfers.results.length === 0) return <EmptyTransactions />;

  return (
    <Box>
      {displayData.map(transfer => {
        return (
          <TransferRow
            key={transfer.transactionHash}
            displayData={transfer}
          />
        );
      })}
      {transfers.next && <MoreTransactions address={safe.address} />}
    </Box>
  );
}
