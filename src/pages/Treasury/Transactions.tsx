import { Box, Divider, HStack, Image, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import arrow from '../../assets/images/transfer-arrow.svg';
import received from '../../assets/images/transfer-received.svg';
import sent from '../../assets/images/transfer-sent.svg';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import { formatDatesDiffReadable } from '../../helpers/dateTime';
import useDisplayName from '../../hooks/useDisplayName';
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
}: {
  isSent: boolean;
  date: string;
  logoUri: string;
  displayAmount: string;
  transferAddress: string;
  isLast: boolean;
}) {
  const displayAddress = useDisplayName(transferAddress);
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
          <Text
            textStyle="text-base-sans-regular"
            color={isSent ? 'grayscale.100' : '#60B55E'}
            data-testid="link-token-name"
          >
            {isSent ? '- ' : '+ ' + displayAmount}
          </Text>
        </HStack>
        <HStack w="33%">
          <Spacer />
          <EtherscanLinkAddress address={transferAddress}>
            <HStack>
              <Text
                textStyle="text-base-sans-regular"
                color="gold.500"
                align="end"
              >
                {displayAddress.displayName}
              </Text>
              <Image
                src={arrow}
                w="0.625rem"
                h="0.625rem"
              />
            </HStack>
          </EtherscanLinkAddress>
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
            />
          )
        );
      })}
    </Box>
  );
}
