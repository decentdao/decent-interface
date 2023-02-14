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
import { Gear } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../providers/Fractal/hooks/useFractal';
import { LabelComponent } from '../../ProposalCreate/InputComponent';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../refactor/BigNumberInput';
import { ICreationStepProps } from '../types';
import { UsulTokenAllocation } from './UsulTokenAllocation';

export function UsulTokenAllocations(props: ICreationStepProps) {
  const { values, setFieldValue, isSubDAO } = props;
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

              {values.govToken.tokenAllocations.map((tokenAllocation, index) => (
                <UsulTokenAllocation
                  key={index}
                  index={index}
                  remove={remove}
                  tokenAllocation={tokenAllocation}
                  {...props}
                />
              ))}
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
                          <BigNumberInput
                            data-testid="tokenVoting-parentTokenAllocationInput"
                            value={values.govToken.parentAllocationAmount?.value || ''}
                            onChange={valuePair =>
                              setFieldValue('govToken.parentAllocationAmount', valuePair)
                            }
                            decimalPlaces={0}
                            isInvalid={false}
                          />
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
              px="0px"
              mx="0px"
              variant="text"
              onClick={() =>
                push({ address: '', amount: { value: '', bigNumberValue: BigNumber.from(0) } })
              }
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
