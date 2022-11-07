import { Box, Divider, HStack, Image, Spacer, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import coinDefault from '../../assets/images/coin-icon-default.svg';
import ethDefault from '../../assets/images/coin-icon-eth.svg';
import nftDefault from '../../assets/images/nft-image-default.svg';
import received from '../../assets/images/transfer-received.svg';
import sent from '../../assets/images/transfer-sent.svg';
import EtherscanLinkAddress from '../../components/ui/EtherscanLinkAddress';
import EtherscanTransactionLink from '../../components/ui/EtherscanTransactionLink';
import { ShortenedAddressLink } from '../../components/ui/ShortenedAddressLink';
import { formatDatesDiffReadable } from '../../helpers/dateTime';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { TokenInfo, TransferType } from '../../providers/fractal/types';
import { formatCoin } from '../../utils/numberFormats';

function TransferRow({
  isSent,
  type,
  date,
  displayAmount,
  transferAddress,
  isLast,
  transactionHash,
  tokenId,
  tokenInfo,
}: {
  isSent: boolean;
  type: TransferType;
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
  let imageSrc;
  switch (type) {
    case TransferType.ERC20_TRANSFER:
    case TransferType.ERC721_TRANSFER:
      imageSrc = tokenInfo?.logoUri;
      break;
    case TransferType.ETHER_TRANSFER:
      imageSrc = ethDefault;
      break;
    default:
      imageSrc = coinDefault;
  }
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
            src={imageSrc}
            fallbackSrc={tokenId ? nftDefault : coinDefault}
            alt={tokenId ? tokenInfo?.name : displayAmount}
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

  if (!transfers || transfers.results.length === 0) return <EmptyTransactions />;

  const results = transfers.results;
  return (
    <Box>
      {results.map(transfer => {
        return (
          <TransferRow
            key={transfer.transactionHash}
            type={transfer.type}
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
            isLast={results[results.length - 1] === transfer}
            transactionHash={transfer.transactionHash}
            tokenId={transfer?.tokenId}
            tokenInfo={transfer?.tokenInfo}
          />
        );
      })}
      {transfers.next && <MoreTransactions address={safe.address} />}
    </Box>
  );
}
