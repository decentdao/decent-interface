import { Text, Flex, Grid, IconButton, Icon, Button } from '@chakra-ui/react';
import { MinusCircle, Plus } from '@phosphor-icons/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { isFeatureEnabled } from '../../../helpers/featureFlags';
import { ICreationStepProps } from '../../../types';
import { MultiInputs } from '../../input/CompositeInput';
import { InputSection } from '../../input/InputSection';
import { IInputSection } from '../../input/Interfaces';
import { EmbeddedAddressInput } from '../../input/TextInput';
import { AddressInput } from '../../ui/forms/EthAddressInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import LabelWrapper from '../../ui/forms/LabelWrapper';
import { NumberStepperInput } from '../../ui/forms/NumberStepperInput';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import useStepRedirect from '../hooks/useStepRedirect';
import { CreateDAOPresenter } from '../presenters/CreateDAOPresenter';
import { DAOCreateMode } from './EstablishEssentials';

export function Multisig(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubmitting, transactionPending, isSubDAO, mode } = props;
  const { t } = useTranslation('daoCreate');
  useStepRedirect({ values });

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

  if (isFeatureEnabled('flag_higher_components')) {
    const section: IInputSection = CreateDAOPresenter.section(undefined);

    const multiSigOwners = CreateDAOPresenter.multiSignOwners(t);

    return (
      <>
        <StepWrapper
          mode={mode}
          isSubDAO={isSubDAO}
          isFormSubmitting={!!isSubmitting || transactionPending}
          allSteps={props.steps}
          stepNumber={2}
        >
          <InputSection {...section}>
            {/* ADD OWNER BUTTON */}
            <Button
              variant="secondary"
              py="0.25rem"
              px="0.5rem"
              alignSelf="flex-end"
              onClick={() => {
                setFieldValue('multisig', {
                  ...values.multisig,
                  numOfSigners: values.multisig.numOfSigners! + 1,
                  trustedAddresses: [...values.multisig.trustedAddresses, ''],
                });
              }}
              size="md"
            >
              <Icon as={Plus} />
              <Text>{t('owner', { ns: 'common' })}</Text>
            </Button>

            <MultiInputs {...multiSigOwners}>
              {values.multisig.trustedAddresses.map((trustedAddress, i) => {
                const errorMessage =
                  errors?.multisig?.trustedAddresses?.[i] && trustedAddress.length
                    ? errors?.multisig?.trustedAddresses?.[i]
                    : undefined;
                const multiSign = CreateDAOPresenter.multiSign(
                  t,
                  i,
                  errorMessage,
                  value => setFieldValue('multisig.trustedAddresses.${i}', value, true),
                  removalIndex => {
                    setFieldValue('multisig', {
                      ...values.multisig,
                      numOfSigners: values.multisig.numOfSigners! - 1,
                      trustedAddresses: values.multisig.trustedAddresses.filter(
                        (_, index) => index !== removalIndex,
                      ),
                    });

                    // If this removal causes the threshold to be higher than the number of signers, adjust the threshold
                    if (values.multisig.signatureThreshold! > values.multisig.numOfSigners! - 1) {
                      setFieldValue(
                        'multisig.signatureThreshold',
                        values.multisig.numOfSigners! - 1,
                      );
                    }
                  },
                );
                <EmbeddedAddressInput
                  {...multiSign}
                  key={multiSign.id}
                />;
              })}
            </MultiInputs>

            <LabelComponent
              label={t('labelSigThreshold')}
              helper={t('helperSigThreshold')}
              errorMessage={
                values.multisig.signatureThreshold ? errors.multisig?.signatureThreshold : undefined
              }
              isRequired
            >
              <Flex w="200px">
                <NumberStepperInput
                  onChange={value => validateNumber(value, 'multisig.signatureThreshold')}
                  value={values.multisig.signatureThreshold}
                />
              </Flex>
            </LabelComponent>
          </InputSection>
        </StepWrapper>
        <StepButtons
          {...props}
          isEdit={mode === DAOCreateMode.EDIT}
        />
      </>
    );
  }
  return (
    <>
      <StepWrapper
        mode={mode}
        isSubDAO={isSubDAO}
        isFormSubmitting={!!isSubmitting || transactionPending}
        allSteps={props.steps}
        stepNumber={2}
      >
        <Flex
          flexDirection="column"
          gap={4}
        >
          {/* ADD OWNER BUTTON */}
          <Button
            variant="secondary"
            py="0.25rem"
            px="0.5rem"
            alignSelf="flex-end"
            onClick={() => {
              setFieldValue('multisig', {
                ...values.multisig,
                numOfSigners: values.multisig.numOfSigners! + 1,
                trustedAddresses: [...values.multisig.trustedAddresses, ''],
              });
            }}
            size="md"
          >
            <Icon as={Plus} />
            <Text>{t('owner', { ns: 'common' })}</Text>
          </Button>

          <LabelComponent
            label={t('titleSignerAddresses')}
            helper={t('subTitleSignerAddresses')}
            alignLabel="flex-start"
            isRequired
          >
            <Flex
              flexDirection="column"
              gap={2}
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
                            isInvalid={!!errorMessage}
                            data-testid={'safeConfig-signer-' + i}
                          />
                        )}
                      </Field>
                      {values.multisig.trustedAddresses.length > 1 && (
                        <IconButton
                          aria-label="remove allocation"
                          variant="secondary"
                          border="0"
                          minW="12"
                          icon={<MinusCircle size="24" />}
                          onClick={async () => {
                            setFieldValue('multisig', {
                              ...values.multisig,
                              numOfSigners: values.multisig.numOfSigners! - 1,
                              trustedAddresses: values.multisig.trustedAddresses.filter(
                                (_, index) => index !== i,
                              ),
                            });

                            // If this removal causes the threshold to be higher than the number of signers, adjust the threshold
                            if (
                              values.multisig.signatureThreshold! >
                              values.multisig.numOfSigners! - 1
                            ) {
                              setFieldValue(
                                'multisig.signatureThreshold',
                                values.multisig.numOfSigners! - 1,
                              );
                            }
                          }}
                          data-testid={'multisig.numOfSigners-' + i}
                        />
                      )}
                    </Grid>
                  </LabelWrapper>
                );
              })}
            </Flex>
          </LabelComponent>

          <LabelComponent
            label={t('labelSigThreshold')}
            helper={t('helperSigThreshold')}
            errorMessage={
              values.multisig.signatureThreshold ? errors.multisig?.signatureThreshold : undefined
            }
            isRequired
          >
            <Flex w="200px">
              <NumberStepperInput
                onChange={value => validateNumber(value, 'multisig.signatureThreshold')}
                value={values.multisig.signatureThreshold}
              />
            </Flex>
          </LabelComponent>
        </Flex>
      </StepWrapper>
      <StepButtons
        {...props}
        isEdit={mode === DAOCreateMode.EDIT}
      />
    </>
  );
}
