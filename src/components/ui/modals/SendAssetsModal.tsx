import { Box, Flex, Select, HStack, Text, Button } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { Field, FieldAttributes, Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useValidationAddress } from '../../../hooks/schemas/common/useValidationAddress';
import { useFractal } from '../../../providers/App/AppProvider';
import { BigIntValuePair } from '../../../types';
import { formatCoinFromAsset, formatCoinUnitsFromAsset } from '../../../utils/numberFormats';
import { sendAssets } from '../../pages/DAOTreasury/sendAssets';
import { BigIntInput } from '../forms/BigIntInput';
import { CustomNonceInput } from '../forms/CustomNonceInput';
import { AddressInput } from '../forms/EthAddressInput';
import LabelWrapper from '../forms/LabelWrapper';
import Divider from '../utils/Divider';

// @todo add Yup and Formik to this modal
export function SendAssetsModal({ close }: { close: () => void }) {
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { t } = useTranslation(['modals', 'common']);

  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);

  const [selectedAsset, setSelectedAsset] = useState<any>(fungibleAssetsWithBalance[0]);
  const [inputAmount, setInputAmount] = useState<BigIntValuePair>();
  const [nonceInput, setNonceInput] = useState<number | undefined>(safe!.nonce);

  const { submitProposal } = useSubmitProposal();

  const handleCoinChange = (index: string) => {
    setInputAmount({ value: '0', bigintValue: 0n });
    setSelectedAsset(fungibleAssetsWithBalance[Number(index)]);
  };

  const onChangeAmount = (value: BigIntValuePair) => {
    setInputAmount(value);
  };

  const overDraft = Number(inputAmount?.value || '0') > formatCoinUnitsFromAsset(selectedAsset);

  // @dev next couple of lines are written like this, to keep typing equivalent during the conversion from BN to bigint
  const inputBigint = inputAmount?.bigintValue;
  const inputBigintIsZero = inputBigint ? inputBigint === 0n : undefined;
  const isSubmitDisabled = !inputAmount || inputBigintIsZero || overDraft;

  const { addressValidationTest, isValidating } = useValidationAddress();

  const submitSendAssets = async (values: { destinationAddress: string }) => {
    const { destinationAddress } = values;

    await sendAssets({
      transferAmount: inputAmount?.bigintValue || 0n,
      asset: selectedAsset,
      destinationAddress,
      nonce: nonceInput,
      submitProposal,
      t,
    });

    if (close) close();
  };

  const sendAssetsValidationSchema = Yup.object().shape({
    destinationAddress: Yup.string().test(addressValidationTest),
  });

  return (
    <Box>
      <Formik
        initialValues={{
          destinationAddress: '',
        }}
        onSubmit={submitSendAssets}
        validationSchema={sendAssetsValidationSchema}
      >
        {({ errors }) => {
          return (
            <Form>
              <Flex>
                {/* ASSET SELECT */}
                <Field name="selectedAsset">
                  {({ field }: FieldAttributes<any>) => (
                    <Box
                      width="40%"
                      marginEnd="0.75rem"
                    >
                      <LabelWrapper label={t('selectLabel')}>
                        <Select
                          {...field}
                          bgColor="neutral-1"
                          borderColor="neutral-3"
                          rounded="sm"
                          cursor="pointer"
                          iconSize="1.5rem"
                          icon={<CaretDown />}
                          onChange={e => handleCoinChange(e.target.value)}
                        >
                          {fungibleAssetsWithBalance.map((asset, index) => (
                            <option
                              key={index}
                              value={index}
                            >
                              {asset.token ? asset.token.symbol : 'ETH'}
                            </option>
                          ))}
                        </Select>
                      </LabelWrapper>
                    </Box>
                  )}
                </Field>

                {/* SEND AMOUNT INPUT */}
                <Field name="inputAmount">
                  {({ field }: FieldAttributes<any>) => (
                    <Box width="60%">
                      <LabelWrapper label={t('amountLabel')}>
                        <BigIntInput
                          {...field}
                          onChange={onChangeAmount}
                          decimalPlaces={selectedAsset?.token?.decimals}
                          placeholder="0"
                          maxValue={BigInt(selectedAsset.balance)}
                          isInvalid={overDraft}
                          errorBorderColor="red-0"
                        />
                      </LabelWrapper>
                    </Box>
                  )}
                </Field>
              </Flex>

              <HStack
                justify="space-between"
                textStyle="neutral-7"
                color="white-0"
                marginTop="0.75rem"
              >
                <Text
                  color={overDraft ? 'red-0' : 'neutral-7'}
                  textStyle="helper-text-base"
                  as="span"
                >
                  {t('selectSublabel', {
                    balance: formatCoinFromAsset(selectedAsset, false),
                  })}
                </Text>
              </HStack>

              <Divider my="1.5rem" />

              {/* DESTINATION ADDRESS INPUT */}
              <Field name={'destinationAddress'}>
                {({ field }: FieldAttributes<any>) => (
                  <LabelWrapper
                    label={t('destinationLabel')}
                    subLabel={t('destinationSublabel')}
                    errorMessage={field.value && errors.destinationAddress}
                  >
                    <AddressInput {...field} />
                  </LabelWrapper>
                )}
              </Field>

              <Divider my="1.5rem" />

              <CustomNonceInput
                nonce={nonceInput}
                onChange={nonce => setNonceInput(nonce ? nonce : undefined)}
              />

              <Button
                marginTop="2rem"
                width="100%"
                type="submit"
                isDisabled={isValidating || !!errors.destinationAddress || isSubmitDisabled}
              >
                {t('sendAssetsSubmit')}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
}
