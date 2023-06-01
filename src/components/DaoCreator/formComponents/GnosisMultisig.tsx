import {
  Box,
  Divider,
  Flex,
  Grid,
  IconButton,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { LabelWrapper, Trash } from '@decent-org/fractal-ui';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import { AddressInput } from '../../ui/forms/EthAddressInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export function GnosisMultisig(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubmitting, transactionPending, isSubDAO } = props;
  const { t } = useTranslation('daoCreate');

  const truncateSignersList = (gnosisAddresses: string[], numOfSigners: number) => {
    const difference = gnosisAddresses.length - numOfSigners;
    return gnosisAddresses.slice(0, gnosisAddresses.length - difference);
  };

  const appendEmptySigners = (gnosisAddresses: string[], numOfSigners: number) => {
    const difference = numOfSigners - gnosisAddresses.length;
    return gnosisAddresses.concat(new Array(difference).fill(''));
  };

  // ensures no decimal places or numbers greater than 99
  const validateNumber = (num: string, fieldValue: string) => {
    let updatedNum = num;
    if (updatedNum.includes('.')) {
      updatedNum = updatedNum.split('.')[0];
    }
    if (updatedNum.length > 2) {
      updatedNum = updatedNum.substring(0, 2);
    }
    setFieldValue(fieldValue, Number(updatedNum).toString());

    return updatedNum !== num;
  };

  const deleteIndex = (deletedIndex: number) => {
    const addresses = values.multisig.trustedAddresses;
    addresses.splice(deletedIndex, 1);
    setFieldValue('multisig', {
      ...values.multisig,
      numOfSigners: --values.multisig.numOfSigners!,
      trustedAddresses: addresses,
    });
  };

  const validateTotalSigners = (numOfSigners: string) => {
    if (validateNumber(numOfSigners, 'multisig.numOfSigners')) return;

    const num = Number(numOfSigners);
    let gnosisAddresses = values.multisig.trustedAddresses;

    const trustedAddressLength = gnosisAddresses.length;

    if (trustedAddressLength !== num) {
      gnosisAddresses =
        num > trustedAddressLength
          ? appendEmptySigners(gnosisAddresses, num)
          : truncateSignersList(gnosisAddresses, num);
    }

    setFieldValue('multisig', {
      ...values.multisig,
      numOfSigners: num,
      trustedAddresses: gnosisAddresses,
    });
  };

  return (
    <StepWrapper
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleSafeConfig"
    >
      <Flex
        flexDirection="column"
        gap={4}
      >
        <LabelComponent
          label={t('labelSigners')}
          helper={t('helperSigners')}
          isRequired
        >
          <NumberInput
            value={values.multisig.numOfSigners}
            onChange={value => validateTotalSigners(value)}
          >
            <NumberInputField data-testid="gnosisConfig-numberOfSignerInput" />
          </NumberInput>
        </LabelComponent>
        <LabelComponent
          label={t('labelSigThreshold')}
          helper={t('helperSigThreshold')}
          errorMessage={
            values.multisig.signatureThreshold ? errors.multisig?.signatureThreshold : undefined
          }
          isRequired
        >
          <NumberInput
            value={values.multisig.signatureThreshold}
            onChange={value => validateNumber(value, 'multisig.signatureThreshold')}
          >
            <NumberInputField data-testid="gnosisConfig-thresholdInput" />
          </NumberInput>
        </LabelComponent>
        <Box my={4}>
          <LabelComponent
            label={t('titleSignerAddresses')}
            helper={t('subTitleSignerAddresses')}
            isRequired={false}
          >
            {values.multisig.trustedAddresses.map((trustedAddress, i) => {
              const errorMessage =
                errors?.multisig?.trustedAddresses?.[i] && trustedAddress.length
                  ? errors?.multisig?.trustedAddresses?.[i]
                  : null;

              return (
                <LabelWrapper
                  key={i}
                  errorMessage={errorMessage}
                >
                  <Grid
                    templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
                    alignItems="center"
                  >
                    <Field name={`multisig.trustedAddresses.${i}`}>
                      {({ field }: FieldAttributes<any>) => (
                        <AddressInput
                          {...field}
                          data-testid={'gnosisConfig-signer-' + i}
                        />
                      )}
                    </Field>
                    {values.multisig.trustedAddresses.length > 1 && (
                      <IconButton
                        aria-label="remove allocation"
                        variant="unstyled"
                        minW={16}
                        icon={
                          <Trash
                            color="gold.500"
                            boxSize="1.5rem"
                          />
                        }
                        type="button"
                        onClick={async () => {
                          deleteIndex(i);
                        }}
                        data-testid={'multisig.numOfSigners-' + i}
                      />
                    )}
                  </Grid>
                </LabelWrapper>
              );
            })}
          </LabelComponent>
        </Box>
      </Flex>
      <Divider
        color="chocolate.700"
        mt="2rem"
        mb="2rem"
      />
      <StepButtons
        {...props}
        nextStep={CreatorSteps.FREEZE_DETAILS}
        prevStep={CreatorSteps.ESSENTIALS}
        isLastStep={!isSubDAO}
      />
    </StepWrapper>
  );
}
