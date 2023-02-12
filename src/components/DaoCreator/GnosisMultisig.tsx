import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Input,
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { Field, FieldArray, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../hooks/utils/useFormHelpers';
import { LabelComponent } from '../ProposalCreate/InputComponent';
import { StepWrapper } from './StepWrapper';
import { CreatorSteps, ICreationStepProps } from './types';

export function GnosisMultisig({
  values,
  errors,
  transactionPending,
  isSubmitting,
  setFieldValue,
  isSubDAO,
  updateStep,
}: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate']);
  const { restrictChars } = useFormHelpers();

  const handleSignersChanges = (numberStr: string) => {
    let numOfSigners = Number(numberStr);
    // greater than 100 signers is unreasonable for manual input here,
    // we don't use an error message because we don't want to render
    // 1000 input fields and lag the app
    if (numOfSigners > 100) {
      numOfSigners = 100;
    }
    const gnosisAddresses = [...values.gnosis.trustedAddresses];
    const trustedAddressLength = gnosisAddresses.length;
    if (trustedAddressLength !== numOfSigners) {
      if (numOfSigners > trustedAddressLength) {
        const difference = numOfSigners - trustedAddressLength;
        gnosisAddresses.push(...new Array(difference).fill(''));
      }
      if (numOfSigners < trustedAddressLength) {
        const difference = trustedAddressLength - numOfSigners;
        gnosisAddresses.splice(trustedAddressLength - difference, difference + 1);
      }
      setFieldValue('gnosis.trustedAddresses', gnosisAddresses);
    }
    setFieldValue('gnosis.numOfSigners', numOfSigners);
  };
  return (
    <StepWrapper titleKey="titleSafeConfig">
      <Flex
        flexDirection="column"
        gap={4}
        mb={8}
      >
        <LabelComponent
          label={t('labelSigners')}
          helper={t('helperSigners')}
          isRequired
        >
          <NumberInput
            value={values.gnosis.numOfSigners}
            min={1}
            onChange={handleSignersChanges}
            onKeyDown={restrictChars}
          >
            <NumberInputField data-testid="gnosisConfig-numberOfSignerInput" />
          </NumberInput>
        </LabelComponent>
        <LabelComponent
          label={t('labelSigThreshold')}
          helper={t('helperSigThreshold')}
          isRequired
        >
          <Field name="gnosis.signatureThreshold">
            {({ field }: FieldAttributes<any>) => (
              <NumberInput
                {...field}
                onKeyDown={restrictChars}
              >
                <NumberInputField data-testid="gnosisConfig-thresholdInput" />
              </NumberInput>
            )}
          </Field>
        </LabelComponent>
        <Box my={8}>
          <LabelComponent
            label={t('titleSignerAddresses')}
            helper={t('subTitleSignerAddresses')}
            isRequired={false}
          >
            <FieldArray name="gnosis.trustedAddresses">
              {({ remove }) => (
                <>
                  {values.gnosis.trustedAddresses.map((trusteeAddress, i) => {
                    const errorMessage =
                      errors?.gnosis?.trustedAddresses?.[i] && trusteeAddress.length
                        ? errors?.gnosis?.trustedAddresses?.[i]
                        : null;

                    return (
                      <Grid
                        key={i}
                        templateColumns="minmax(auto, 100%) minmax(auto, 1fr)"
                        alignItems="center"
                      >
                        <LabelWrapper errorMessage={errorMessage}>
                          <Field name={`gnosis.trustedAddresses.${i}`}>
                            {({ field }: FieldAttributes<any>) => (
                              <Input
                                {...field}
                                placeholder="0x0000...0000"
                                data-testid={'gnosisConfig-signer-' + i}
                              />
                            )}
                          </Field>
                        </LabelWrapper>
                        {values.gnosis.trustedAddresses.length > 1 && (
                          <Button
                            variant="text"
                            onClick={() => {
                              setFieldValue('gnosis.numOfSigners', --values.gnosis.numOfSigners);
                              remove(i);
                            }}
                          >
                            {t('remove')}
                          </Button>
                        )}
                      </Grid>
                    );
                  })}
                </>
              )}
            </FieldArray>
          </LabelComponent>
        </Box>
      </Flex>
      <Divider color="chocolate.700" />
      <Flex alignItems="center">
        <Button
          variant="text"
          onClick={() => updateStep(CreatorSteps.ESSENTIALS)}
        >
          {t('prev', { ns: 'common' })}
        </Button>
        <Button
          w="full"
          type={!isSubDAO ? 'submit' : 'button'}
          onClick={() => (!isSubDAO ? {} : updateStep(CreatorSteps.GUARD_CONFIG))}
          disabled={transactionPending || isSubmitting || !!errors.gnosis}
        >
          {t(!isSubDAO ? 'deploy' : 'next', { ns: 'common' })}
        </Button>
      </Flex>
    </StepWrapper>
  );
}
