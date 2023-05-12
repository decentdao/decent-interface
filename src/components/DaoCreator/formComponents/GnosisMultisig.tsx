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
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import { AddressInput } from '../../ui/forms/EthAddressInput';
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
      setFieldValue('multisig.numOfSigners', numOfSigners);
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

    setFieldValue('multisig', {
      ...values.multisig,
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
            value={values.multisig.numOfSigners}
            onChange={(_, inputNum) =>
              handleSignersChanges(values.multisig.trustedAddresses, inputNum)
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
            values.multisig.signatureThreshold ? errors.multisig?.signatureThreshold : undefined
          }
          isRequired
        >
          <NumberInput
            value={values.multisig.signatureThreshold}
            onKeyDown={restrictChars}
            onChange={value => setFieldValue('multisig.signatureThreshold', value)}
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
                          handleSignersChanges(
                            values.multisig.trustedAddresses,
                            --values.multisig.numOfSigners!,
                            i
                          );
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
        mb={4}
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
