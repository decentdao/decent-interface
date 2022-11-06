import { Box, Text } from '@chakra-ui/react';
import { useFractal } from '../../providers/fractal/hooks/useFractal';
import { AssetTransfer, TransferType } from '../../providers/fractal/types';
import { coinFormatter } from '../../utils/numberFormats';

function isSentTransfer(safeAddress: string | undefined, transfer: AssetTransfer) {
  return safeAddress === transfer.from;
}

function formattedDate(transfer: AssetTransfer) {
  return transfer.executionDate; // TODO
}

function formattedAmount(transfer: AssetTransfer) {
  return coinFormatter(transfer.value, transfer?.tokenInfo?.decimals, transfer?.tokenInfo?.symbol);
}

function addressDisplay(safeAddress: string | undefined, transfer: AssetTransfer) {
  return isSentTransfer(safeAddress, transfer) ? transfer.to : transfer.from;
}

export function Transactions() {
  const {
    gnosis: { safe },
    treasury: { transfers },
  } = useFractal();
  // const { t } = useTranslation('treasury');
  return (
    <Box>
      {transfers.map(transfer => {
        return (
          transfer.type != TransferType.ERC721_TRANSFER && (
            <Box key={transfer.transactionHash}>
              <Text>-----</Text>
              <Text>{isSentTransfer(safe.address, transfer) ? 'true' : 'false'}</Text>
              <Text>{formattedDate(transfer)}</Text>
              <Text>{formattedAmount(transfer)}</Text>
              <Text>{addressDisplay(safe.address, transfer)}</Text>
            </Box>
          )
        );
      })}
    </Box>
  );
}
