import { Input, IconButton } from '@chakra-ui/react';
import { LabelWrapper, Trash } from '@decent-org/fractal-ui';
import { BigNumber } from 'ethers';
import { Field, FieldAttributes } from 'formik';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
interface ITokenAllocations {
  index: number;
  remove: <T>(index: number) => T | undefined;
  setFieldValue: (field: string, value: any) => void;
  addressErrorMessage: string | null;
  amountErrorMessage: string | null;
  amountInputValue: BigNumber | undefined;
  allocationLength: number;
}

export function UsulTokenAllocation({
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
        <Field name={`govToken.tokenAllocations.${index}.address`}>
          {({ field }: FieldAttributes<any>) => (
            <Input
              {...field}
              placeholder="0x0000...0000"
              data-testid={'tokenVoting-tokenAllocationAddressInput-' + index}
            />
          )}
        </Field>
      </LabelWrapper>
      <LabelWrapper errorMessage={amountErrorMessage}>
        <BigNumberInput
          value={amountInputValue}
          onChange={valuePair =>
            setFieldValue(`govToken.tokenAllocations.${index}.amount`, valuePair)
          }
          data-testid={'tokenVoting-tokenAllocationAmountInput-' + index}
          onKeyDown={restrictChars}
        />
      </LabelWrapper>
      {allocationLength > 1 && (
        <IconButton
          aria-label="remove allocation"
          variant="unstyled"
          minW="0"
          mt={2}
          icon={
            <Trash
              color="gold.500"
              boxSize="1.5rem"
            />
          }
          type="button"
          onClick={() => remove(index)}
          data-testid={'tokenVoting-tokenAllocationRemoveButton-' + index}
        />
      )}
    </>
  );
}
