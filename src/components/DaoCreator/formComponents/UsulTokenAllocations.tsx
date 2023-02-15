import { Box, Grid, Text, Button } from '@chakra-ui/react';
import { FieldArray, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { TokenAllocation } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberValuePair } from '../../ui/forms/BigNumberInput';
import { ICreationStepProps } from '../types';
import { UsulTokenAllocation } from './UsulTokenAllocation';

export function UsulTokenAllocations(props: ICreationStepProps) {
  const { values, errors } = props;
  const { t } = useTranslation('daoCreate');

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
