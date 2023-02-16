import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Grid,
  Text,
} from '@chakra-ui/react';
import { Gear, LabelWrapper } from '@decent-org/fractal-ui';
import { FieldArray, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { TokenAllocation } from '../../../types';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput, BigNumberValuePair } from '../../ui/forms/BigNumberInput';
import { ICreationStepProps } from '../types';
import { UsulTokenAllocation } from './UsulTokenAllocation';

export function UsulTokenAllocations(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubDAO } = props;
  const { t } = useTranslation('daoCreate');
  const {
    governance: { governanceToken },
  } = useFractal();

  const canReceiveParentAllocations = isSubDAO && governanceToken?.address;

  return (
    <Box>
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      <FieldArray name="govToken.tokenAllocations">
        {({ remove, push }) => (
          <Box my={4}>
            <Grid
              gridTemplateColumns={
                values.govToken.tokenAllocations.length > 1 ? '1fr 35% 2rem' : '1fr 1fr'
              }
              columnGap={4}
              rowGap={2}
              data-testid="tokenVoting-tokenAllocations"
            >
              <Text
                textStyle="text-md-sans-regular"
                color="grayscale.100"
              >
                {t('titleAddress')}
              </Text>
              <Text
                textStyle="text-md-sans-regular"
                color="grayscale.100"
              >
                {t('titleAmount')}
              </Text>
              {values.govToken.tokenAllocations.length > 1 && <Box>{/* EMPTY */}</Box>}

              {values.govToken.tokenAllocations.map((tokenAllocation, index) => {
                const tokenAllocationError = (
                  errors?.govToken?.tokenAllocations as FormikErrors<
                    TokenAllocation<BigNumberValuePair>[] | undefined
                  >
                )?.[index];

                const addressErrorMessage =
                  tokenAllocationError?.address && tokenAllocation.address.length
                    ? tokenAllocationError.address
                    : null;
                const amountErrorMessage =
                  tokenAllocationError?.amount?.value &&
                  !tokenAllocation.amount.bigNumberValue?.isZero()
                    ? tokenAllocationError.amount.value
                    : null;

                return (
                  <UsulTokenAllocation
                    key={index}
                    index={index}
                    remove={remove}
                    addressErrorMessage={addressErrorMessage}
                    amountErrorMessage={amountErrorMessage}
                    amountInputValue={values.govToken.tokenAllocations[index].amount.bigNumberValue}
                    allocationLength={values.govToken.tokenAllocations.length}
                    {...props}
                  />
                );
              })}
            </Grid>
            <Text
              color="grayscale.500"
              textStyle="text-md-sans-regular"
            >
              {t('helperAllocations')}
            </Text>
            {canReceiveParentAllocations && (
              <Accordion allowToggle>
                <AccordionItem
                  borderTop="none"
                  borderBottom="none"
                  bg="black.900-semi-transparent"
                  my={8}
                  py={4}
                  rounded="lg"
                >
                  {({ isExpanded }) => (
                    <>
                      <AccordionButton
                        textStyle="text-button-md-semibold"
                        color="grayscale.100"
                      >
                        <Gear
                          marginRight={3}
                          transform={`rotate(-${isExpanded ? '0' : '90'}deg)`}
                        />
                        {t('advanced', { ns: 'common' })}
                      </AccordionButton>
                      <AccordionPanel paddingBottom={4}>
                        <LabelComponent
                          label={t('labelParentAllocation')}
                          helper={t('helperParentAllocation')}
                          isRequired={false}
                        >
                          <LabelWrapper
                            errorMessage={
                              (
                                values.govToken.parentAllocationAmount?.bigNumberValue &&
                                (errors.govToken?.parentAllocationAmount as any)
                              )?.value
                            }
                          >
                            <BigNumberInput
                              data-testid="tokenVoting-parentTokenAllocationInput"
                              value={values.govToken.parentAllocationAmount?.bigNumberValue}
                              onChange={valuePair =>
                                setFieldValue('govToken.parentAllocationAmount', valuePair)
                              }
                              decimalPlaces={0}
                              isInvalid={false}
                            />
                          </LabelWrapper>
                        </LabelComponent>
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              </Accordion>
            )}
            <Button
              size="base"
              maxWidth="fit-content"
              px={0}
              mx={0}
              variant="text"
              onClick={() => push({ address: '', amount: { value: '' } })}
              data-testid="tokenVoting-addAllocation"
            >
              {t('labelAddAllocation')}
            </Button>
          </Box>
        )}
      </FieldArray>
    </Box>
  );
}
