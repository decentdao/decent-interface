import { Box, Divider, HStack, Image, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import received from '../../assets/images/transfer-received.svg';
import sent from '../../assets/images/transfer-sent.svg';
import EtherscanTransactionLink from '../../components/ui/EtherscanTransactionLink';
import { ShortenedAddressLink } from '../../components/ui/ShortenedAddressLink';
import { formatDatesDiffReadable } from '../../helpers/dateTime';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TransferType } from '../../providers/fractal/types';
import { formatCoin } from '../../utils/numberFormats';

function TransferRow({
  isSent,
  date,
  logoUri,
  displayAmount,
  transferAddress,
  isLast,
  transactionHash,
}: {
  isSent: boolean;
  date: string;
  logoUri: string;
  displayAmount: string;
  transferAddress: string;
  isLast: boolean;
  transactionHash: string;
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
            src={logoUri}
            fallbackSrc=""
            w="1.25rem"
            h="1.25rem"
          />
          <EtherscanTransactionLink txHash={transactionHash}>
            <Text
              textStyle="text-base-sans-regular"
              color={isSent ? 'grayscale.100' : '#60B55E'}
              data-testid="link-token-amount"
            >
              {isSent ? '- ' : '+ ' + displayAmount}
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

export function Transactions() {
  const {
    gnosis: { safe },
    treasury: { transfers },
  } = useFractal();
  return (
    <Box>
      {transfers.map(transfer => {
        return (
          transfer.type != TransferType.ERC721_TRANSFER && (
            <TransferRow
              key={transfer.transactionHash}
              isSent={safe.address === transfer.from}
              date={transfer.executionDate}
              logoUri={''}
              displayAmount={formatCoin(
                transfer.value,
                transfer?.tokenInfo?.decimals,
                transfer?.tokenInfo?.symbol
              )}
              transferAddress={safe.address === transfer.from ? transfer.to : transfer.from}
              isLast={transfers[transfers.length - 1] === transfer}
              transactionHash={transfer.transactionHash}
            />
          )
        );
      })}
    </Box>
  );
}
