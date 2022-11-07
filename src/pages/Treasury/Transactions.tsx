import { Box, Divider, HStack, Image, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import received from '../../assets/images/transfer-received.svg';
import sent from '../../assets/images/transfer-sent.svg';
import EtherscanTransactionLink from '../../components/ui/EtherscanTransactionLink';
import { ShortenedAddressLink } from '../../components/ui/ShortenedAddressLink';
import { formatDatesDiffReadable } from '../../helpers/dateTime';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TokenInfo } from '../../providers/fractal/types';
import { formatCoin } from '../../utils/numberFormats';

function TransferRow({
  isSent,
  date,
  displayAmount,
  transferAddress,
  isLast,
  transactionHash,
  tokenId,
  tokenInfo,
}: {
  isSent: boolean;
  date: string;
  displayAmount?: string;
  transferAddress: string;
  isLast: boolean;
  transactionHash: string;
  tokenId?: string;
  tokenInfo?: TokenInfo;
}) {
  const { t } = useTranslation(['treasury', 'common']);
  const dateFormatted = formatDatesDiffReadable(new Date(date), new Date(), t);
  return (
    <Box>
      <HStack
        align="center"
        marginTop="1rem"
        marginBottom={isLast ? '0rem' : '1rem'}
      >
        <HStack w="33%">
          <Image
            src={isSent ? sent : received}
            w="1.5rem"
            h="1.5rem"
          />
          <Box paddingStart="0.5rem">
            <Text
              textStyle="text-sm-sans-regular"
              color="grayscale.100"
            >
              {t(isSent ? 'labelSent' : 'labelReceived')}
            </Text>
            <Text
              textStyle="text-base-sans-regular"
              color="chocolate.200"
            >
              {dateFormatted}
            </Text>
          </Box>
        </HStack>
        <HStack w="33%">
          <Image
            src={tokenInfo ? tokenInfo.logoUri : ''}
            fallbackSrc=""
            w="1.25rem"
            h="1.25rem"
          />
          <EtherscanTransactionLink txHash={transactionHash}>
            <Text
              textStyle="text-base-sans-regular"
              color={isSent ? 'grayscale.100' : '#60B55E'}
              data-testid={tokenId ? 'link-token-name' : 'link-token-amount'}
            >
              {(isSent ? '- ' : '+ ') +
                (tokenId ? tokenInfo?.name + ' #' + tokenId : displayAmount)}
            </Text>
          </EtherscanTransactionLink>
        </HStack>
        <HStack w="33%">
          <Spacer />
          <ShortenedAddressLink
            data-testid="link-transfer-address"
            address={transferAddress}
          />
        </HStack>
      </HStack>
      {!isLast && <Divider color="chocolate.700" />}
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

export function Transactions() {
  const {
    gnosis: { safe },
    treasury: { transfers },
  } = useFractal();
  return (
    <Box>
      {transfers.length === 0 && <EmptyTransactions />}
      {transfers.map(transfer => {
        return (
          <TransferRow
            key={transfer.transactionHash}
            isSent={safe.address === transfer.from}
            date={transfer.executionDate}
            displayAmount={
              transfer?.tokenId
                ? undefined
                : formatCoin(
                    transfer.value,
                    transfer?.tokenInfo?.decimals,
                    transfer?.tokenInfo?.symbol
                  )
            }
            transferAddress={safe.address === transfer.from ? transfer.to : transfer.from}
            isLast={transfers[transfers.length - 1] === transfer}
            transactionHash={transfer.transactionHash}
            tokenId={transfer?.tokenId}
            tokenInfo={transfer?.tokenInfo}
          />
        );
      })}
    </Box>
  );
}
