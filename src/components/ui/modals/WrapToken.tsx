import { Button, Flex, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { Formik, FormikProps } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20Abi, getContract } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import * as Yup from 'yup';
import { logError } from '../../../helpers/errorLogging';
import { useERC20LinearToken } from '../../../hooks/DAO/loaders/governance/useERC20LinearToken';
import useSafeContracts from '../../../hooks/safe/useSafeContracts';
import useApproval from '../../../hooks/utils/useApproval';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { useEthersSigner } from '../../../providers/Ethers/hooks/useEthersSigner';
import { AzoriusGovernance, BigIntValuePair } from '../../../types';
import { formatCoin } from '../../../utils';
import { BigIntInput } from '../forms/BigIntInput';

export function WrapToken({ close }: { close: () => void }) {
  const { governance, governanceContracts } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const signer = useEthersSigner();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { address: account } = useAccount();
  const [userBalance, setUserBalance] = useState<BigIntValuePair>({
    value: '',
    bigintValue: 0n,
  });
  const baseContracts = useSafeContracts();

  const { loadERC20TokenAccountData } = useERC20LinearToken({ onMount: false });
  const [contractCall, pending] = useTransaction();
  const {
    approved,
    approveTransaction,
    pending: approvalPending,
  } = useApproval(
    baseContracts?.votesTokenMasterCopyContract?.asSigner.attach(
      governanceContracts.underlyingTokenAddress!,
    ),
    azoriusGovernance.votesToken?.address,
    userBalance.bigintValue,
  );

  const { t } = useTranslation(['modals', 'treasury']);
  const { restrictChars } = useFormHelpers();

  const getUserUnderlyingTokenBalance = useCallback(async () => {
    if (
      !azoriusGovernance.votesToken?.decimals ||
      !azoriusGovernance.votesToken.underlyingTokenData ||
      !publicClient ||
      !account
    )
      return;
    const baseTokenContract = getContract({
      address: azoriusGovernance.votesToken.underlyingTokenData.address,
      abi: erc20Abi,
      client: { wallet: walletClient, public: publicClient },
    });
    try {
      const [balance, decimals] = await Promise.all([
        baseTokenContract.read.balanceOf([account]),
        baseTokenContract.read.decimals(),
      ]);
      setUserBalance({
        value: formatCoin(
          balance,
          false,
          decimals,
          azoriusGovernance.votesToken?.underlyingTokenData?.symbol,
        ),
        bigintValue: balance,
      });
    } catch (e) {
      logError(e);
      return;
    }
  }, [account, azoriusGovernance.votesToken, publicClient, walletClient]);

  useEffect(() => {
    getUserUnderlyingTokenBalance();
  }, [getUserUnderlyingTokenBalance]);

  const handleFormSubmit = useCallback(
    (amount: BigIntValuePair) => {
      const { votesTokenContractAddress } = governanceContracts;
      if (!votesTokenContractAddress || !signer || !account || !baseContracts) return;
      const wrapperTokenContract =
        baseContracts.votesERC20WrapperMasterCopyContract.asSigner.attach(
          votesTokenContractAddress,
        );
      contractCall({
        contractFn: () => wrapperTokenContract.depositFor(account, amount.bigintValue!),
        pendingMessage: t('wrapTokenPendingMessage'),
        failedMessage: t('wrapTokenFailedMessage'),
        successMessage: t('wrapTokenSuccessMessage'),
        successCallback: async () => {
          await loadERC20TokenAccountData();
        },
        completedCallback: () => {
          close();
        },
      });
    },
    [
      account,
      contractCall,
      governanceContracts,
      signer,
      close,
      t,
      loadERC20TokenAccountData,
      baseContracts,
    ],
  );

  // @dev next couple of lines are written like this, to keep typing equivalent during the conversion from BN to bigint
  const userBalanceBigIntValue = userBalance.bigintValue;
  const userBalanceBigIntValueIsZero = userBalanceBigIntValue
    ? userBalanceBigIntValue === 0n
    : undefined;

  if (
    !azoriusGovernance.votesToken?.decimals ||
    !azoriusGovernance.votesToken.underlyingTokenData ||
    userBalanceBigIntValueIsZero
  ) {
    return null;
  }

  return (
    <Formik
      initialValues={{
        amount: { value: '', bigintValue: 0n },
      }}
      onSubmit={values => {
        const { amount } = values;
        handleFormSubmit(amount);
      }}
      validationSchema={Yup.object().shape({
        amount: Yup.object({
          value: Yup.string().required(),
          bigintValue: Yup.mixed().required(),
        }).test({
          name: 'Wrap Token Validation',
          message: t('wrapTokenError'),
          test: amount => {
            const amountBN = amount.bigintValue as bigint;
            if (!amount) return false;

            if (amountBN === 0n) return false;
            if (userBalance.bigintValue! === 0n) return false;
            if (amountBN > userBalance.bigintValue!) return false;
            return true;
          },
        }),
      })}
    >
      {({ handleSubmit, values, setFieldValue, errors }: FormikProps<any>) => {
        return (
          <form onSubmit={handleSubmit}>
            <Flex
              flexDirection="column"
              gap={8}
            >
              <LabelWrapper
                label={t('assetWrapTitle')}
                subLabel={t('assetWrapSubLabel')}
              >
                <Input
                  value={azoriusGovernance.votesToken?.underlyingTokenData?.name}
                  disabled={true}
                />
              </LabelWrapper>

              <LabelWrapper
                label={t('assetWrapAmountLabel')}
                subLabel={t('selectSublabel', { balance: userBalance.value })}
              >
                <BigIntInput
                  value={values.amount.bigintValue}
                  decimalPlaces={azoriusGovernance.votesToken?.decimals}
                  onChange={valuePair => setFieldValue('amount', valuePair)}
                  data-testid="wrapToken-amount"
                  onKeyDown={restrictChars}
                  maxValue={userBalance.bigintValue}
                />
              </LabelWrapper>

              {approved ? (
                <Button
                  type="submit"
                  isDisabled={!!errors.amount || pending}
                >
                  {t('wrapTokenButton')}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={approveTransaction}
                  isDisabled={approvalPending}
                >
                  {t('approveToken', { ns: 'treasury' })}
                </Button>
              )}
            </Flex>
          </form>
        );
      }}
    </Formik>
  );
}
