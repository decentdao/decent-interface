import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { formatStrToBigNumber } from '../../../helpers';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { TextButton } from '../../ui/forms/Button';
import Input from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import { InputBN } from '../provider/types';
import TokenAllocationInput from './TokenAllocationInput';

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[];
  supply: BigNumber | null;
  parentAllocationAmount?: InputBN;
  fieldUpdate: (value: any, field: string) => void;
}

function TokenAllocations({
  tokenAllocations,
  supply,
  parentAllocationAmount,
  fieldUpdate,
}: TokenAllocationsProps) {
  const [hasAmountError, setAmountError] = useState(false);

  const updateTokenAllocation = (index: number, tokenAllocation: TokenAllocation) => {
    const newTokenAllocations = [...tokenAllocations];
    newTokenAllocations[index] = tokenAllocation;
    fieldUpdate(newTokenAllocations, 'tokenAllocations');
  };

  const addTokenAllocation = () => {
    if (tokenAllocations === undefined) {
      fieldUpdate([{ address: '', amount: { value: '', valueBN: null } }], 'tokenAllocations');
      return;
    }
    fieldUpdate(
      [
        ...tokenAllocations,
        {
          address: '',
          amount: BigNumber.from(0),
        },
      ],
      'tokenAllocations'
    );
  };

  const removeTokenAllocation = (index: number) => {
    if (tokenAllocations === undefined) return;
    fieldUpdate(
      [...tokenAllocations.slice(0, index), ...tokenAllocations.slice(index + 1)],
      'tokenAllocations'
    );
  };

  const onParentAllocationChange = (value: string) => {
    fieldUpdate({ value, valueBN: formatStrToBigNumber(value || '0') }, 'parentAllocationAmount');
  };

  useEffect(() => {
    const totalAllocated = tokenAllocations
      .map(tokenAllocation => tokenAllocation.amount.bigNumberValue || BigNumber.from(0))
      .reduce((prev, curr) => prev.add(curr), BigNumber.from(0));
    if (supply && supply.gt(0)) {
      // no DAO token allocation with no parent allocations
      if (
        totalAllocated.gt(0) &&
        (!parentAllocationAmount?.valueBN || parentAllocationAmount.valueBN.lte(0))
      ) {
        setAmountError(supply.lt(totalAllocated));
        // parent tokens allocated but no DAO token allocation
      } else if (
        parentAllocationAmount?.valueBN &&
        totalAllocated.lte(0) &&
        parentAllocationAmount.valueBN?.gt(0)
      ) {
        setAmountError(supply.lt(parentAllocationAmount.valueBN));
        // parent tokens allocated with DAO token allocation
      } else if (
        parentAllocationAmount?.valueBN &&
        totalAllocated.gt(0) &&
        parentAllocationAmount.valueBN?.gt(0)
      ) {
        setAmountError(supply.lt(totalAllocated.add(parentAllocationAmount.valueBN)));
      } else {
        // no allocation set amount error to false
        setAmountError(false);
      }
    }
  }, [tokenAllocations, supply, parentAllocationAmount]);

  return (
    <div>
      <div className=" text-gray-50 pb-2">Token Allocations</div>
      {parentAllocationAmount !== undefined && (
        <InputBox>
          <Input
            type="number"
            value={parentAllocationAmount.value}
            onChange={e => onParentAllocationChange(e.target.value)}
            label="Parent Allocation Amount"
            helperText="Amount of tokens to allocate to parent DAO"
            disabled={false}
            min="0"
            errorMessage={hasAmountError ? 'Allocated more than supply' : ''}
          />
        </InputBox>
      )}
      <InputBox>
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-4 md:col-span-5 text-xs text-gray-25">Address</div>
          <div className="col-span-2 text-xs text-gray-25">Amount</div>
          {tokenAllocations &&
            tokenAllocations.map((tokenAllocation, index) => (
              <TokenAllocationInput
                key={index}
                index={index}
                hasAmountError={hasAmountError}
                tokenAllocation={tokenAllocation}
                updateTokenAllocation={updateTokenAllocation}
                removeTokenAllocation={removeTokenAllocation}
              />
            ))}
        </div>
        <TextButton
          onClick={() => addTokenAllocation()}
          className="px-0 my-1 mx-0"
          label="Add Allocation +"
        />
      </InputBox>
    </div>
  );
}

export default TokenAllocations;
