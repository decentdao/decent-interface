import { Button, Flex, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { Formik, FormikProps } from 'formik';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount, useSigner } from 'wagmi';
import * as Yup from 'yup';
import { VotesERC20Wrapper } from '../../../assets/typechain-types/VotesERC20Wrapper';
import { useERC20LinearToken } from '../../../hooks/DAO/loaders/governance/useERC20LinearToken';
import useApproval from '../../../hooks/utils/useApproval';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useTransaction } from '../../../hooks/utils/useTransaction';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, BigNumberValuePair } from '../../../types';
import { formatCoin } from '../../../utils';
import { BigNumberInput } from '../forms/BigNumberInput';

export function UnwrapToken({ close }: { close: () => void }) {
  const { governance, governanceContracts } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const { data: signer } = useSigner();
  const { address: account } = useAccount();

  const { loadERC20TokenAccountData } = useERC20LinearToken({ onMount: false });

  const [contractCall, pending] = useTransaction();
  const {
    approved,
    approveTransaction,
    pending: approvalPending,
  } = useApproval(
    governanceContracts.tokenContract?.asSigner.attach(governanceContracts.underlyingTokenAddress!),
    azoriusGovernance.votesToken.address
  );

  const { t } = useTranslation(['modals', 'treasury']);
  const { restrictChars } = useFormHelpers();

  const handleFormSubmit = useCallback(
    (amount: BigNumberValuePair) => {
      const { tokenContract } = governanceContracts;
      if (!tokenContract || !signer || !account) return;
      const wrapperTokenContract = tokenContract.asSigner as VotesERC20Wrapper;
      contractCall({
        contractFn: () => wrapperTokenContract.withdrawTo(account, amount.bigNumberValue!),
        pendingMessage: t('unwrapTokenPendingMessage'),
        failedMessage: t('unwrapTokenFailedMessage'),
        successMessage: t('unwrapTokenSuccessMessage'),
        successCallback: async () => {
          loadERC20TokenAccountData();
        },
        completedCallback: () => {
          close();
        },
      });
    },
    [account, contractCall, governanceContracts, signer, close, t, loadERC20TokenAccountData]
  );

  if (
    !azoriusGovernance.votesToken.balance ||
    !azoriusGovernance.votesToken.decimals ||
    azoriusGovernance.votesToken.balance?.isZero()
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
          name: 'Unwrap Token Validation',
          message: t('unwrapTokenError'),
          test: amount => {
            const amountBN = amount.bigNumberValue as BigNumber;
            if (!amount) return false;

            if (amountBN.isZero()) return false;
            if (azoriusGovernance.votesToken.balance!.isZero()) return false;
            if (amountBN.gt(azoriusGovernance.votesToken.balance!!)) return false;
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
                label={t('assetUnwrapTitle')}
                subLabel={t('assetUnwrapSubLabel')}
              >
                <Input
                  value={azoriusGovernance.votesToken.name}
                  disabled={true}
                />
              </LabelWrapper>

              <LabelWrapper
                label={t('assetUnwrapAmountLabel')}
                subLabel={t('selectSublabel', {
                  balance: formatCoin(
                    azoriusGovernance.votesToken.balance!,
                    false,
                    azoriusGovernance.votesToken.decimals!,
                    azoriusGovernance.votesToken?.symbol
                  ),
                })}
              >
                <BigNumberInput
                  value={values.amount.bigNumberValue}
                  decimalPlaces={azoriusGovernance.votesToken.decimals}
                  onChange={valuePair => setFieldValue('amount', valuePair)}
                  data-testid="unWrapToken-amount"
                  onKeyDown={restrictChars}
                  maxValue={azoriusGovernance.votesToken.balance!}
                  isDisabled={!approved}
                />
              </LabelWrapper>

              {approved ? (
                <Button
                  type="submit"
                  isDisabled={!!errors.amount || pending}
                >
                  {t('unwrapTokenButton')}
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
