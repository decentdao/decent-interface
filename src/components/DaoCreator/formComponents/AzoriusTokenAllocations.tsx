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
import { BACKGROUND_SEMI_TRANSPARENT } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import {
  AzoriusGovernance,
  BigIntValuePair,
  ICreationStepProps,
  TokenAllocation,
} from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { AzoriusTokenAllocation } from './AzoriusTokenAllocation';

export function AzoriusTokenAllocations(props: ICreationStepProps) {
  const { values, errors, setFieldValue, isSubDAO } = props;
  const { t } = useTranslation('daoCreate');
  const { governance } = useFractal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const canReceiveParentAllocations = isSubDAO && azoriusGovernance.votesToken?.address;

  return (
    <Box>
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      <FieldArray name="erc20Token.tokenAllocations">
        {({ remove, push }) => (
          <Box my={4}>
            <Grid
              gridTemplateColumns="1fr 35% 2rem"
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
              <Box>{/* EMPTY */}</Box>

              {values.erc20Token.tokenAllocations.map((tokenAllocation, index) => {
                const tokenAllocationError = (
                  errors?.erc20Token?.tokenAllocations as FormikErrors<
                    TokenAllocation<BigIntValuePair>[] | undefined
                  >
                )?.[index];

                const addressErrorMessage =
                  tokenAllocationError?.address && tokenAllocation.address.length
                    ? tokenAllocationError.address
                    : null;

                const amountErrorMessage =
                  values.erc20Token.tokenSupply.value &&
                  tokenAllocationError?.amount?.value &&
                  !(tokenAllocation.amount.bigintValue ?? 0n === 0n)
                    ? tokenAllocationError.amount.value
                    : null;

                return (
                  <AzoriusTokenAllocation
                    key={index}
                    index={index}
                    remove={remove}
                    addressErrorMessage={addressErrorMessage}
                    amountErrorMessage={amountErrorMessage}
                    amountInputValue={values.erc20Token.tokenAllocations[index].amount.bigintValue}
                    allocationLength={values.erc20Token.tokenAllocations.length}
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
            {canReceiveParentAllocations && (
              <Accordion allowToggle>
                <AccordionItem
                  borderTop="none"
                  borderBottom="none"
                  bg={BACKGROUND_SEMI_TRANSPARENT}
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
                                values.erc20Token.parentAllocationAmount?.bigintValue &&
                                (errors.erc20Token?.parentAllocationAmount as any)
                              )?.value
                            }
                          >
                            <BigIntInput
                              data-testid="tokenVoting-parentTokenAllocationInput"
                              value={values.erc20Token.parentAllocationAmount?.bigintValue}
                              onChange={valuePair =>
                                setFieldValue('erc20Token.parentAllocationAmount', valuePair)
                              }
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
          </Box>
        )}
      </FieldArray>
    </Box>
  );
}
