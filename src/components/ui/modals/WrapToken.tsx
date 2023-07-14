import { Button, Flex, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { VotesERC20Wrapper } from '@fractal-framework/fractal-contracts';
import { BigNumber, Contract } from 'ethers';
import { Formik, FormikProps } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20ABI, useAccount, useSigner } from 'wagmi';
import * as Yup from 'yup';
import { logError } from '../../../helpers/errorLogging';
import { useERC20LinearToken } from '../../../hooks/DAO/loaders/governance/useERC20LinearToken';
import useApproval from '../../../hooks/utils/useApproval';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, BigNumberValuePair } from '../../../types';
import { formatCoin } from '../../../utils';
import { BigNumberInput } from '../forms/BigNumberInput';

export function WrapToken({ close }: { close: () => void }) {
  const { governance, governanceContracts } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const { data: signer } = useSigner();
  const { address: account } = useAccount();
  const [userBalance, setUserBalance] = useState<BigNumberValuePair>({
    value: '',
    bigNumberValue: BigNumber.from(0),
  });

  const { loadERC20TokenAccountData } = useERC20LinearToken({ onMount: false });
  const [contractCall, pending] = useTransaction();
  const {
    approved,
    approveTransaction,
    pending: approvalPending,
  } = useApproval(
    governanceContracts.tokenContract?.asSigner.attach(governanceContracts.underlyingTokenAddress!),
    azoriusGovernance.votesToken?.address,
    userBalance.bigNumberValue
  );

  const { t } = useTranslation(['modals', 'treasury']);
  const { restrictChars } = useFormHelpers();

  const getUserUnderlyingTokenBalance = useCallback(async () => {
    if (
      !azoriusGovernance.votesToken?.decimals ||
      !azoriusGovernance.votesToken.underlyingTokenData ||
      !signer ||
      !account
    )
      return;
    const baseTokenContract = new Contract(
      azoriusGovernance.votesToken.underlyingTokenData.address,
      erc20ABI,
      signer
    );
    try {
      const [balance, decimals]: [BigNumber, number] = await Promise.all([
        baseTokenContract.balanceOf(account),
        baseTokenContract.decimals(),
      ]);
      setUserBalance({
        value: formatCoin(
          balance,
          false,
          decimals,
          azoriusGovernance.votesToken?.underlyingTokenData?.symbol
        ),
        bigNumberValue: balance,
      });
    } catch (e) {
      logError(e);
      return;
    }
  }, [account, azoriusGovernance.votesToken, signer]);

  useEffect(() => {
    getUserUnderlyingTokenBalance();
  }, [getUserUnderlyingTokenBalance]);

  const handleFormSubmit = useCallback(
    (amount: BigNumberValuePair) => {
      const { tokenContract } = governanceContracts;
      if (!tokenContract || !signer || !account) return;
      const wrapperTokenContract = tokenContract.asSigner as VotesERC20Wrapper;
      contractCall({
        contractFn: () => wrapperTokenContract.depositFor(account, amount.bigNumberValue!),
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
    [account, contractCall, governanceContracts, signer, close, t, loadERC20TokenAccountData]
  );

  if (
    !azoriusGovernance.votesToken?.decimals ||
    !azoriusGovernance.votesToken.underlyingTokenData ||
    userBalance.bigNumberValue?.isZero()
  ) {
    return null;
  }

  return (
    <Formik
      initialValues={{
        amount: { value: '', bigNumberValue: BigNumber.from(0) },
      }}
      onSubmit={values => {
        const { amount } = values;
        handleFormSubmit(amount);
      }}
      validationSchema={Yup.object().shape({
        amount: Yup.object({
          value: Yup.string().required(),
          bigNumberValue: Yup.mixed().required(),
        }).test({
          name: 'Wrap Token Validation',
          message: t('wrapTokenError'),
          test: amount => {
            const amountBN = amount.bigNumberValue as BigNumber;
            if (!amount) return false;

            if (amountBN.isZero()) return false;
            if (userBalance.bigNumberValue!.isZero()) return false;
            if (amountBN.gt(userBalance.bigNumberValue!)) return false;
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
                <BigNumberInput
                  value={values.amount.bigNumberValue}
                  decimalPlaces={azoriusGovernance.votesToken?.decimals}
                  onChange={valuePair => setFieldValue('amount', valuePair)}
                  data-testid="wrapToken-amount"
                  onKeyDown={restrictChars}
                  maxValue={userBalance.bigNumberValue}
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
