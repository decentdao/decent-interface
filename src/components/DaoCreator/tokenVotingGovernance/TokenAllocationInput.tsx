import { Button, Input, NumberInput, NumberInputField } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { ethers, utils } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';

interface TokenAllocationProps {
  index: number;
  tokenAllocation: TokenAllocation;
  tokenAllocations: TokenAllocation[];
  hasAmountError: boolean;
  updateTokenAllocation: (
    index: number,
    snapshotTokenAllocations: TokenAllocation[],
    tokenAllocation: TokenAllocation
  ) => void;
  removeTokenAllocation: (updatedAllocations: TokenAllocation[]) => void;
}

function TokenAllocationInput({
  index,
  tokenAllocation,
  tokenAllocations,
  hasAmountError,
  updateTokenAllocation,
  removeTokenAllocation,
}: TokenAllocationProps) {
  const { t } = useTranslation(['common', 'daoCreate']);

  const { limitDecimalsOnKeyDown } = useFormHelpers();

  const updateAddress = useCallback(
    (
      address: string,
      snapShotTokenAllocation: TokenAllocation,
      snapShotTokenAllocations: TokenAllocation[]
    ) => {
      let isValidAddress = isAddress(address);
      let hasDuplicateAddresses = false;

      const updatedTokenAllocations = snapShotTokenAllocations.map((allocated, i, arr) => {
        // if a duplicate address is found updates the error on that input and invalidates the address.
        const isDuplicateAddress =
          isAddress(allocated.address) &&
          isAddress(address) &&
          allocated.address.toLowerCase() === address.toLowerCase() &&
          i !== index;
        if (isDuplicateAddress) {
          hasDuplicateAddresses = true;
          return {
            ...allocated,
            addressError: t('errorDuplicateAddress', { ns: 'daoCreate' }),
            isValidAddress: false,
          };
        }

        // searches for prev duplicate, if duplicate was updated, error is reset on it.
        const prevAllocationState = arr[index];
        const isOldDuplicateAddress =
          isAddress(allocated.address) &&
          isAddress(prevAllocationState.address) &&
          allocated.address.toLowerCase() === prevAllocationState.address.toLowerCase() &&
          address.toLowerCase() !== allocated.address.toLowerCase() &&
          i !== index;
        if (isOldDuplicateAddress) {
          // resets error on duplicate
          return {
            ...allocated,
            addressError: undefined,
            isValidAddress: true,
          };
        }
        return allocated;
      });

      const errorMsg = hasDuplicateAddresses
        ? t('errorDuplicateAddress', { ns: 'daoCreate' })
        : !isValidAddress && address.trim()
        ? t('errorInvalidAddress')
        : undefined;

      updateTokenAllocation(index, updatedTokenAllocations, {
        address: address,
        isValidAddress: isValidAddress,
        amount: snapShotTokenAllocation.amount,
        addressError: errorMsg,
      });
    },
    [index, t, updateTokenAllocation]
  );

  const updateAmount = useCallback(
    (
      value: string,
      snapShotTokenAllocation: TokenAllocation,
      snapShotTokenAllocations: TokenAllocation[]
    ) => {
      updateTokenAllocation(index, snapShotTokenAllocations, {
        address: snapShotTokenAllocation.address,
        isValidAddress: snapShotTokenAllocation.isValidAddress,
        amount: { value, bigNumberValue: utils.parseUnits(value || '0', DEFAULT_TOKEN_DECIMALS) },
        addressError: snapShotTokenAllocation.addressError,
      });
    },
    [index, updateTokenAllocation]
  );

  const removeAllocation = useCallback(
    (allocationIndex: number) => {
      const allocations = [...tokenAllocations].map((allocated, i, arr): TokenAllocation => {
        // if a duplicate address is found removes error on duplicate.
        const isDuplicateAddress =
          isAddress(allocated.address) &&
          isAddress(arr[allocationIndex].address) &&
          allocated.address.toLowerCase() === arr[allocationIndex].address.toLowerCase() &&
          i !== allocationIndex;
        if (isDuplicateAddress) {
          return {
            ...allocated,
            addressError: undefined,
            isValidAddress: isAddress(allocated.address),
          };
        }
        return allocated;
      });
      const filteredAllocations = [
        ...allocations.slice(0, allocationIndex),
        ...allocations.slice(allocationIndex + 1),
      ];
      removeTokenAllocation(filteredAllocations);
    },
    [tokenAllocations, removeTokenAllocation]
  );

  return (
    <>
      <LabelWrapper
        errorMessage={
          tokenAllocation.addressError
            ? tokenAllocation.addressError
            : hasAmountError
            ? '‎'
            : undefined
        }
      >
        <Input
          value={tokenAllocation.address}
          placeholder={ethers.constants.AddressZero}
          onChange={event => updateAddress(event.target.value, tokenAllocation, tokenAllocations)}
          data-testid="tokenVoting-tokenAllocationAddressInput"
          isInvalid={!!tokenAllocation.addressError}
        />
      </LabelWrapper>
      <LabelWrapper
        errorMessage={
          hasAmountError
            ? t('errorOverallocated', { ns: 'daoCreate' })
            : tokenAllocation.addressError
            ? '‎'
            : undefined
        }
      >
        <NumberInput
          value={tokenAllocation.amount.value}
          onChange={tokenAmount => updateAmount(tokenAmount, tokenAllocation, tokenAllocations)}
          isInvalid={hasAmountError}
          data-testid="tokenVoting-tokenAllocationAmountInput"
          onKeyDown={e =>
            limitDecimalsOnKeyDown(e, tokenAllocation.amount.value, DEFAULT_TOKEN_DECIMALS)
          }
        >
          <NumberInputField />
        </NumberInput>
      </LabelWrapper>
      <Button
        variant="text"
        type="button"
        onClick={() => removeAllocation(index)}
        px="0px"
        data-testid="tokenVoting-tokenAllocationRemoveButton"
      >
        {t('remove')}
      </Button>
    </>
  );
}

export default TokenAllocationInput;
