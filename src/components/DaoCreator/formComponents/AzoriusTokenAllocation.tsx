import { IconButton, Box } from '@chakra-ui/react';
import { LabelWrapper, Minus } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { Field, FieldAttributes } from 'formik';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { AddressInput } from '../../ui/forms/EthAddressInput';
interface ITokenAllocations {
  index: number;
  remove: <T>(index: number) => T | undefined;
  setFieldValue: (field: string, value: any) => void;
  addressErrorMessage: string | null;
  amountErrorMessage: string | null;
  amountInputValue?: BigNumber | null;
  allocationLength: number;
}

export function AzoriusTokenAllocation({
  index,
  addressErrorMessage,
  amountErrorMessage,
  amountInputValue,
  remove,
  setFieldValue,
  allocationLength,
}: ITokenAllocations) {
  const { restrictChars } = useFormHelpers();

  return (
    <>
      <LabelWrapper errorMessage={addressErrorMessage}>
        <Field name={`erc20Token.tokenAllocations.${index}.address`}>
          {({ field }: FieldAttributes<any>) => (
            <AddressInput
              {...field}
              data-testid={'tokenVoting-tokenAllocationAddressInput-' + index}
            />
          )}
        </Field>
      </LabelWrapper>
      <LabelWrapper errorMessage={amountErrorMessage}>
        <BigNumberInput
          value={amountInputValue}
          onChange={valuePair =>
            setFieldValue(`erc20Token.tokenAllocations.${index}.amount`, valuePair)
          }
          data-testid={'tokenVoting-tokenAllocationAmountInput-' + index}
          onKeyDown={restrictChars}
        />
      </LabelWrapper>
      {allocationLength > 1 ? (
        <IconButton
          aria-label="remove allocation"
          variant="unstyled"
          minW="0"
          color="gold.500"
          _hover={{ color: 'gold.500-hover' }}
          mt={2}
          icon={
            <Minus
              fill="currentColor"
              boxSize="1.5rem"
            />
          }
          type="button"
          onClick={() => remove(index)}
          data-testid={'tokenVoting-tokenAllocationRemoveButton-' + index}
        />
      ) : (
        <Box>{/* EMPTY */}</Box>
      )}
    </>
  );
}
