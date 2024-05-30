import { Alert, AlertTitle, Button, Flex, Text } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getAddress, getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import ERC20ClaimAbi from '../../../assets/abi/ERC20Claim';
import { Alert as AlertIcon } from '../../../assets/theme/custom/icons/Alert';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../types';
import { formatCoin } from '../../../utils/numberFormats';

export function ERCO20Claim() {
  const [userClaimable, setUserClaimable] = useState(0n);
  const {
    governance,
    readOnly: { user },
  } = useFractal();
  const account = user.address;
  const { tokenClaimContractAddress, type } = governance;
  const { t } = useTranslation(['dashboard', 'transaction']);
  const [, pending, contractCallViem] = useTransaction();
  const azoriusGovernance = governance as AzoriusGovernance;
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const loadClaim = useCallback(async () => {
    if (!tokenClaimContractAddress || !type || !account || !publicClient) {
      return;
    }
    const tokenClaimContract = getContract({
      abi: ERC20ClaimAbi,
      address: tokenClaimContractAddress,
      client: publicClient,
    });
    const claimableAmount = await tokenClaimContract.read.getClaimAmount([getAddress(account)]);
    setUserClaimable(claimableAmount);
  }, [account, publicClient, tokenClaimContractAddress, type]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  const claimToken = async () => {
    if (!tokenClaimContractAddress || !azoriusGovernance.votesToken || !account || !walletClient) {
      return;
    }
    const claimableString = formatCoin(
      userClaimable,
      false,
      azoriusGovernance.votesToken.decimals,
      azoriusGovernance.votesToken.symbol,
    );
    const tokenClaimContract = getContract({
      abi: ERC20ClaimAbi,
      address: tokenClaimContractAddress,
      client: walletClient,
    });
    contractCallViem({
      contractFn: () => tokenClaimContract.write.claimTokens([getAddress(account)]),
      pendingMessage: t('pendingTokenClaim', {
        symbol: azoriusGovernance.votesToken.symbol,
        ns: 'transaction',
      }),
      failedMessage: t('failedTokenClaim', {
        symbol: azoriusGovernance.votesToken.symbol,
        ns: 'transaction',
      }),
      successMessage: t('successTokenClaim', {
        amount: claimableString,
        symbol: azoriusGovernance.votesToken.symbol,
        ns: 'transaction',
      }),
      successCallback: loadClaim,
    });
  };

  if (!azoriusGovernance.votesToken || userClaimable === 0n) return null;
  const claimableString = formatCoin(
    userClaimable,
    false,
    azoriusGovernance.votesToken.decimals,
    azoriusGovernance.votesToken.symbol,
  );
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
        <AlertIcon boxSize="24px" />
        <AlertTitle>
          <Text whiteSpace="pre-wrap">
            {t('alertTokenClaim', {
              amount: claimableString,
            })}
          </Text>
        </AlertTitle>
      </Flex>
      <Button
        variant="text"
        onClick={claimToken}
        isDisabled={pending}
      >
        {t('claim')}
      </Button>
    </Alert>
  );
}
