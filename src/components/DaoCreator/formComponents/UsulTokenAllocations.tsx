import { Box, Grid, Text, Button } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { FieldArray } from 'formik';
import { useTranslation } from 'react-i18next';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { ICreationStepProps } from '../types';
import { UsulTokenAllocation } from './UsulTokenAllocation';

export function UsulTokenAllocations({ values, errors, ...rest }: ICreationStepProps) {
  // @todo add parentTokenAllocation back

  // useEffect(() => {
  //   const totalAllocated = tokenAllocations
  //     .map(tokenAllocation => tokenAllocation.amount || BigNumber.from(0))
  //     .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
  //   if (supply && supply.gt(0)) {
  //     // no DAO token allocation with no parent allocations
  //     if (totalAllocated.gt(0) && !parentAllocationAmount?.lte(0)) {
  //       setAmountError(supply.lt(totalAllocated));
  //       // parent tokens allocated but no DAO token allocation
  //     } else if (parentAllocationAmount?.gt(0) && totalAllocated.lte(0)) {
  //       setAmountError(supply.lt(parentAllocationAmount));
  //       // parent tokens allocated with DAO token allocation
  //     } else if (parentAllocationAmount?.gt(0) && totalAllocated.gt(0)) {
  //       setAmountError(supply.lt(totalAllocated.add(parentAllocationAmount)));
  //     } else {
  //       // no allocation set amount error to false
  //       setAmountError(false);
  //     }
  //   }
  // }, [tokenAllocations, supply, parentAllocationAmount]);

  const { t } = useTranslation('daoCreate');

  return (
    <Box>
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      {/* {canReceiveParentAllocations && !!parentAllocationAmount && (
        <InputBox>
          <LabelWrapper
            label={t('labelParentAllocation')}
            subLabel={t('helperParentAllocation')}
            errorMessage={hasAmountError ? t('errorOverallocated') : ''}
          >
            <BigNumberInput
              data-testid="tokenVoting-parentTokenAllocationInput"
              value={parentAllocationAmount}
              onChange={onParentAllocationChange}
              decimalPlaces={0}
              isInvalid={hasAmountError}
            />
          </LabelWrapper>
        </InputBox>
      )} */}
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
                  values={values}
                  errors={errors}
                  remove={remove}
                  {...rest}
                  tokenAllocation={tokenAllocation}
                />
              ))}
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
