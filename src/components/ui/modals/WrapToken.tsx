import { Button, Checkbox, Flex, Input } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, Contract } from 'ethers';
import { Formik, FormikProps } from 'formik';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { erc20ABI, useAccount, useSigner } from 'wagmi';
import * as Yup from 'yup';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { useFractal } from '../../../providers/App/AppProvider';
import { AzoriusGovernance, BigNumberValuePair } from '../../../types';
import { formatCoin } from '../../../utils';
import { BigNumberInput } from '../forms/BigNumberInput';

export function WrapToken({ close }: { close: () => void }) {
  const { governance } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const { data: signer } = useSigner();
  const { address: account } = useAccount();

  const [userBalance, setUserBalance] = useState<BigNumberValuePair>({
    value: '',
    bigNumberValue: BigNumber.from(0),
  });

  const { t } = useTranslation('modals');
  const { restrictChars } = useFormHelpers();
  const getUserUderlyingTokenBalance = useCallback(async () => {
    if (
      !azoriusGovernance.votesToken.decimals ||
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
    const [balance, decimals]: [BigNumber, number] = await Promise.all([
      baseTokenContract.balanceOf(account),
      baseTokenContract.decimals(),
    ]);
    // formatCoin(
    //   balance,
    //   false,
    //   decimals,
    //   azoriusGovernance.votesToken.underlyingTokenData?.symbol
    // )
    setUserBalance({
      value: formatCoin(
        balance,
        false,
        decimals,
        azoriusGovernance.votesToken.underlyingTokenData?.symbol
      ),
      bigNumberValue: balance,
    });
  }, [account, azoriusGovernance.votesToken, signer]);

  useEffect(() => {
    getUserUderlyingTokenBalance();
  }, [getUserUderlyingTokenBalance]);

  // @todo submit callback
  const handleFormSubmit = useCallback(() => {}, []);
  // @todo add delegate to self checkbox to form values
  if (
    !azoriusGovernance.votesToken.decimals ||
    !azoriusGovernance.votesToken.underlyingTokenData ||
    userBalance.bigNumberValue?.isZero()
  ) {
    return null;
  }
  return (
    <Formik
      initialValues={{
        amount: { value: '', bigNumberValue: BigNumber.from(0) },
        delegateToSelf: false,
      }}
      onSubmit={() => {}}
      validationSchema={Yup.object().shape({
        amount: Yup.object({
          value: Yup.string().required(),
          bigNumberValue: Yup.mixed().required(),
        }).test({
          name: 'Wrap Token Validation',
          message: 'Invalid amount',
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
                  value={azoriusGovernance.votesToken.underlyingTokenData?.name}
                  disabled={true}
                />
              </LabelWrapper>

              <LabelWrapper
                label={t('assetWrapAmountLabel')}
                subLabel={t('selectSublabel', { balance: userBalance.value })}
              >
                <BigNumberInput
                  value={values.amount.bigNumberValue}
                  decimalPlaces={azoriusGovernance.votesToken.decimals}
                  onChange={valuePair => setFieldValue('amount', valuePair)}
                  data-testid="wrapToken-amount"
                  onKeyDown={restrictChars}
                />
              </LabelWrapper>

              <Checkbox
                color="gold.500"
                isChecked={values.delegateToSelf}
                onChange={() => setFieldValue('linkSelfDelegate', !values.delegateToSelf)}
              >
                {t('linkSelfDelegate')}
              </Checkbox>

              <Button isDisabled={!!errors.amount}>Wrap</Button>
            </Flex>
          </form>
        );
      }}
    </Formik>
  );
}
