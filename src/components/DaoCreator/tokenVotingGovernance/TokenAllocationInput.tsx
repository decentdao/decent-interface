import { Button, Input, Text } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { BigNumber, ethers } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { isSameAddress } from '../../../utils/crypto';
import { BigNumberInput, BigNumberValuePair } from '../../ui/BigNumberInput';

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

  const updateAddress = useCallback(
    (
      address: string,
      snapShotTokenAllocations: TokenAllocation[],
      snapShotTokenAllocation: TokenAllocation
    ) => {
      let isValidAddress = isAddress(address);
      let hasDuplicateAddresses = false;

      const updatedTokenAllocations = snapShotTokenAllocations.map((allocated, i, prev) => {
        const isDuplicate = i !== index && isSameAddress(allocated.address, address);

        const hasOtherDuplicates = prev.some(
          (prevAddr, dupIndex) =>
            index != dupIndex &&
            i !== dupIndex &&
            isSameAddress(prevAddr.address, allocated.address)
        );

        if (isDuplicate) {
          hasDuplicateAddresses = true;
          isValidAddress = false;
        }

        const hasAddressError = isDuplicate || hasOtherDuplicates;
        return {
          ...allocated,
          isValidAddress: hasAddressError || isAddress(allocated.address),
          addressError: hasAddressError
            ? t('errorDuplicateAddress', { ns: 'daoCreate' })
            : undefined,
        };
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
      value: BigNumber,
      snapShotTokenAllocations: TokenAllocation[],
      snapShotTokenAllocation: TokenAllocation
    ) => {
      updateTokenAllocation(index, snapShotTokenAllocations, {
        address: snapShotTokenAllocation.address,
        isValidAddress: snapShotTokenAllocation.isValidAddress,
        amount: value,
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
          onChange={event => updateAddress(event.target.value, tokenAllocations, tokenAllocation)}
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
        <BigNumberInput
          value={tokenAllocation.amount}
          onChange={tokenAmount =>
            updateAmount(tokenAmount.bigNumberValue, tokenAllocations, tokenAllocation)
          }
          data-testid="tokenVoting-tokenAllocationAmountInput"
          isInvalid={hasAmountError}
        />
      </LabelWrapper>
      {tokenAllocations.length > 1 && (
        <Button
          variant="text"
          type="button"
          onClick={() => removeAllocation(index)}
          px="0px"
          alignSelf="center"
          data-testid="tokenVoting-tokenAllocationRemoveButton"
        >
          {t('remove')}
        </Button>
      )}
    </>
  );
}

export default TokenAllocationInput;
