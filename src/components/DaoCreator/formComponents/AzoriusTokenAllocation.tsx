import { IconButton, Box } from '@chakra-ui/react';
import { MinusCircle } from '@phosphor-icons/react';
import { Field, FieldAttributes } from 'formik';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { AddressInput } from '../../ui/forms/EthAddressInput';
import LabelWrapper from '../../ui/forms/LabelWrapper';
interface ITokenAllocations {
  index: number;
  remove: <T>(index: number) => T | undefined;
  setFieldValue: (field: string, value: any) => void;
  addressErrorMessage: string | null;
  amountErrorMessage: string | null;
  amountInputValue?: bigint;
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
              marginTop="-0.25rem" // Freaking LabelWrapper
              data-testid={'tokenVoting-tokenAllocationAddressInput-' + index}
            />
          )}
        </Field>
      </LabelWrapper>
      <LabelWrapper errorMessage={amountErrorMessage}>
        <BigIntInput
          marginTop="-0.25rem" // Freaking LabelWrapper
          value={amountInputValue}
          onChange={valuePair =>
            setFieldValue(`erc20Token.tokenAllocations.${index}.amount`, valuePair)
          }
          data-testid={'tokenVoting-tokenAllocationAmountInput-' + index}
          onKeyDown={restrictChars}
          placeholder="100,000"
        />
      </LabelWrapper>
      {allocationLength > 1 ? (
        <IconButton
          aria-label="remove allocation"
          icon={<MinusCircle size="24" />}
          variant="unstyled"
          minWidth="auto"
          color="lilac-0"
          _disabled={{ opacity: 0.4, cursor: 'default' }}
          sx={{ '&:disabled:hover': { color: 'inherit', opacity: 0.4 } }}
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
