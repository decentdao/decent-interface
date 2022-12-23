import { Box, Grid, Text, Button } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { BigNumberInput, BigNumberValuePair } from '../../ui/BigNumberInput';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import TokenAllocationInput from './TokenAllocationInput';

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[];
  supply: BigNumber | undefined;
  parentAllocationAmount?: BigNumber;
  canReceiveParentAllocations: boolean;
  fieldUpdate: (key: string, value: any) => void;
}

function TokenAllocations({
  tokenAllocations,
  supply,
  parentAllocationAmount,
  canReceiveParentAllocations,
  fieldUpdate,
}: TokenAllocationsProps) {
  const [hasAmountError, setAmountError] = useState(false);

  const updateTokenAllocation = useCallback(
    (
      index: number,
      snapShotTokenAllocations: TokenAllocation[],
      tokenAllocation: TokenAllocation
    ) => {
      const newTokenAllocations = [...snapShotTokenAllocations];
      newTokenAllocations[index] = { ...tokenAllocation };
      fieldUpdate('tokenAllocations', newTokenAllocations);
    },
    [fieldUpdate]
  );

  const addTokenAllocation = () => {
    const newTokenAllocation: TokenAllocation = {
      address: '',
      isValidAddress: false,
      amount: undefined,
    };

    if (tokenAllocations === undefined) {
      fieldUpdate('tokenAllocations', [newTokenAllocation]);
      return;
    }

    fieldUpdate('tokenAllocations', [...tokenAllocations, newTokenAllocation]);
  };

  const removeTokenAllocation = (updatedTokenAllocations: TokenAllocation[]) => {
    if (tokenAllocations === undefined) return;
    fieldUpdate('tokenAllocations', updatedTokenAllocations);
  };

  const onParentAllocationChange = (value: BigNumberValuePair) => {
    fieldUpdate('parentAllocationAmount', value.bigNumberValue);
  };

  useEffect(() => {
    const totalAllocated = tokenAllocations
      .map(tokenAllocation => tokenAllocation.amount || BigNumber.from(0))
      .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
    if (supply && supply.gt(0)) {
      // no DAO token allocation with no parent allocations
      if (totalAllocated.gt(0) && !parentAllocationAmount?.lte(0)) {
        setAmountError(supply.lt(totalAllocated));
        // parent tokens allocated but no DAO token allocation
      } else if (parentAllocationAmount?.gt(0) && totalAllocated.lte(0)) {
        setAmountError(supply.lt(parentAllocationAmount));
        // parent tokens allocated with DAO token allocation
      } else if (parentAllocationAmount?.gt(0) && totalAllocated.gt(0)) {
        setAmountError(supply.lt(totalAllocated.add(parentAllocationAmount)));
      } else {
        // no allocation set amount error to false
        setAmountError(false);
      }
    }
  }, [tokenAllocations, supply, parentAllocationAmount]);

  const { t } = useTranslation('daoCreate');

  return (
    <Box>
      {/* @todo add translations */}
      <ContentBoxTitle>{t('titleAllocations')}</ContentBoxTitle>
      {canReceiveParentAllocations && !!parentAllocationAmount && (
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
              isInvalid={hasAmountError}
            />
          </LabelWrapper>
        </InputBox>
      )}
      <InputBox>
        <Grid
          gridTemplateColumns="1fr max-content 5rem"
          gap="2"
          data-testid="tokenVoting-tokenAllocations"
        >
          <Text
            textStyle="text-base-sans-bold"
            color="grayscale.500"
          >
            {t('titleAddress')}
          </Text>
          <Text
            textStyle="text-base-sans-bold"
            color="grayscale.500"
          >
            {t('titleAmount')}
          </Text>
          <Box>{/* EMPTY */}</Box>
          {tokenAllocations &&
            tokenAllocations.map((tokenAllocation, index) => (
              <TokenAllocationInput
                key={index}
                index={index}
                hasAmountError={hasAmountError}
                tokenAllocation={tokenAllocation}
                tokenAllocations={tokenAllocations}
                updateTokenAllocation={updateTokenAllocation}
                removeTokenAllocation={removeTokenAllocation}
              />
            ))}
        </Grid>
        <Button
          size="base"
          maxWidth="fit-content"
          px="0px"
          mx="0px"
          variant="text"
          onClick={() => addTokenAllocation()}
          data-testid="tokenVoting-addAllocation"
        >
          {t('labelAddAllocation')}
        </Button>
        <Text
          color="grayscale.500"
          textStyle="text-md-sans-regular"
        >
          {t('helperAllocations')}
        </Text>
      </InputBox>
    </Box>
  );
}

export default TokenAllocations;
