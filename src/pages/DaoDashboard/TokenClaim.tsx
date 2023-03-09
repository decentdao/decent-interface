import { Alert, AlertTitle, Button, Flex, Text } from '@chakra-ui/react';
import { Info } from '@decent-org/fractal-ui';
import { BigNumber, utils } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from 'wagmi';
import { useTransaction } from '../../hooks/utils/useTransaction';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { formatCoin } from '../../utils/numberFormats';

export function TokenClaim() {
  const [userClaimable, setUserClaimable] = useState(BigNumber.from(0));
  const { address: account } = useAccount();
  const {
    governance: { tokenClaimContract, governanceToken },
  } = useFractal();

  const { t } = useTranslation(['dashboard', 'transaction']);
  const [contractCall, pending] = useTransaction();

  const loadClaim = useCallback(async () => {
    if (!tokenClaimContract || !governanceToken || !account) {
      return;
    }
    const claimableAmount = await tokenClaimContract.getClaimAmount(account);
    setUserClaimable(claimableAmount);
  }, [tokenClaimContract, governanceToken, account]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  const claimToken = async () => {
    if (!tokenClaimContract || !governanceToken || !account) {
      return;
    }
    const claimableString = formatCoin(userClaimable, false, governanceToken.decimals);
    contractCall({
      contractFn: () => tokenClaimContract?.claimToken(account),
      pendingMessage: t('pendingTokenClaim', { symbol: governanceToken.symbol, ns: 'transaction' }),
      failedMessage: t('failedTokenClaim', { symbol: governanceToken.symbol, ns: 'transaction' }),
      successMessage: t('successTokenClaim', {
        amount: claimableString,
        symbol: governanceToken.symbol,
        ns: 'transaction',
      }),
      successCallback: loadClaim,
    });
  };

  if (!governanceToken || userClaimable.isZero()) return null;
  const claimableString = utils.formatUnits(userClaimable, governanceToken.decimals);
  return (
    <Alert
      status="info"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={8}
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
      >
        <Info boxSize="24px" />
        <AlertTitle>
          <Text
            textStyle="text-lg-mono-medium"
            whiteSpace="pre-wrap"
          >
            {t('alertTokenClaim', {
              amount: claimableString,
              symbol: governanceToken.symbol,
            })}
          </Text>
        </AlertTitle>
      </Flex>
      <Button
        variant="text"
        onClick={claimToken}
        disabled={pending}
      >
        {t('claim')}
      </Button>
    </Alert>
  );
}
