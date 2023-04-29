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
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export function GnosisMultisig(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate']);
  const { values, errors, setFieldValue, isSubmitting, transactionPending, isSubDAO } = props;
  const { restrictChars } = useFormHelpers();

  const truncateSignersList = (gnosisAddresses: string[], numOfSigners: number) => {
    const difference = gnosisAddresses.length - numOfSigners;
    return gnosisAddresses.slice(0, gnosisAddresses.length - difference);
  };

  const appendEmptySigners = (gnosisAddresses: string[], numOfSigners: number) => {
    const difference = numOfSigners - gnosisAddresses.length;
    return gnosisAddresses.concat(new Array(difference).fill(''));
  };

  const handleSignersChanges = (
    gnosisAddresses: string[],
    numOfSigners?: number,
    index?: number
  ) => {
    if (numOfSigners === undefined) {
      setFieldValue('gnosis.numOfSigners', numOfSigners);
    }

    numOfSigners = Math.min(numOfSigners || 0, 99);
    const trustedAddressLength = gnosisAddresses.length;

    if (numOfSigners && trustedAddressLength !== numOfSigners) {
      gnosisAddresses =
        numOfSigners > trustedAddressLength
          ? appendEmptySigners(gnosisAddresses, numOfSigners)
          : truncateSignersList(gnosisAddresses, numOfSigners);

      if (index !== undefined) {
        gnosisAddresses.splice(index, 1);
      }
    }

    setFieldValue('gnosis', {
      ...values.gnosis,
      numOfSigners: numOfSigners,
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
            value={values.gnosis.numOfSigners}
            onChange={(_, inputNum) =>
              handleSignersChanges(values.gnosis.trustedAddresses, inputNum)
            }
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
                          handleSignersChanges(
                            values.gnosis.trustedAddresses,
                            --values.gnosis.numOfSigners!,
                            i
                          );
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
