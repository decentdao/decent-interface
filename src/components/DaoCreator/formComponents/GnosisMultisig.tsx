import {
  Box,
  Divider,
  Flex,
  Grid,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { LabelWrapper, Trash } from '@decent-org/fractal-ui';
import { Field, FieldAttributes } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export function GnosisMultisig(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate']);
  const {
    values,
    errors,
    setFieldValue,
    isSubmitting,
    transactionPending,
    isSubDAO,
    validateForm,
    setErrors,
  } = props;
  const { restrictChars } = useFormHelpers();

  const handleSignersChanges = (_: string, numberStr: number, index?: number) => {
    let numOfSigners = Number(numberStr || 0);
    // greater than 99 signers is unreasonable for manual input here,
    // we don't use an error message because we don't want to render
    // 1000 input fields and lag the app
    if (numOfSigners > 99) {
      numOfSigners = 99;
    }
    const gnosisAddresses = [...values.gnosis.trustedAddresses];
    const trustedAddressLength = gnosisAddresses.length;
    if (trustedAddressLength !== numOfSigners) {
      if (!numOfSigners || numOfSigners < 1) {
        numOfSigners = 1;
      }
      if (numOfSigners > trustedAddressLength) {
        const difference = numOfSigners - trustedAddressLength;
        gnosisAddresses.push(...new Array(difference).fill(''));
      }
      if (numOfSigners < trustedAddressLength) {
        const difference = trustedAddressLength - numOfSigners;
        if (index !== undefined) {
          gnosisAddresses.splice(index, 1);
        } else {
          gnosisAddresses.splice(trustedAddressLength - difference, difference + 1);
        }
      }
      if (gnosisAddresses.length) {
        setFieldValue('gnosis.trustedAddresses', gnosisAddresses);
      }
    }
    setFieldValue('gnosis.numOfSigners', numOfSigners);
  };

  useEffect(() => {
    if (values.gnosis.numOfSigners !== values.gnosis.trustedAddresses.length) {
      (async () => {
        setErrors(await validateForm(values));
      })();
    }
  }, [values, validateForm, setErrors]);

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
            value={values.gnosis.numOfSigners}
            min={1}
            onChange={(inputStr, inputNum) => handleSignersChanges(inputStr, inputNum)}
            onKeyDown={restrictChars}
          >
            <NumberInputField data-testid="gnosisConfig-numberOfSignerInput" />
          </NumberInput>
        </LabelComponent>
        <LabelComponent
          label={t('labelSigThreshold')}
          helper={t('helperSigThreshold')}
          errorMessage={
            values.gnosis.signatureThreshold ? errors.gnosis?.signatureThreshold : undefined
          }
          isRequired
        >
          <NumberInput
            value={values.gnosis.signatureThreshold}
            onKeyDown={restrictChars}
            onChange={value => setFieldValue('gnosis.signatureThreshold', value)}
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
            {values.gnosis.trustedAddresses.map((trustedAddress, i) => {
              const errorMessage =
                errors?.gnosis?.trustedAddresses?.[i] && trustedAddress.length
                  ? errors?.gnosis?.trustedAddresses?.[i]
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
                    <Field name={`gnosis.trustedAddresses.${i}`}>
                      {({ field }: FieldAttributes<any>) => (
                        <Input
                          {...field}
                          placeholder="0x0000...0000"
                          data-testid={'gnosisConfig-signer-' + i}
                        />
                      )}
                    </Field>
                    {values.gnosis.trustedAddresses.length > 1 && (
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
                          handleSignersChanges('', --values.gnosis.numOfSigners, i);
                        }}
                        data-testid={'gnosis.numOfSigners-' + i}
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
        mb={4}
      />
      <StepButtons
        {...props}
        nextStep={CreatorSteps.GUARD_CONFIG}
        prevStep={CreatorSteps.ESSENTIALS}
        isLastStep={!isSubDAO}
      />
    </StepWrapper>
  );
}
