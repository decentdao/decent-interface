import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/fractal/hooks/useFractal';

// TODO implement /v1/safes/{address}/transfers/ (https://safe-transaction-mainnet.safe.global/) and display here
export function Transactions() {
  const {
    gnosis: { safe },
    treasury: { assetsFungible, assetsNonFungible },
  } = useFractal();
  const { t } = useTranslation('treasury');
  return <Box></Box>;
}
