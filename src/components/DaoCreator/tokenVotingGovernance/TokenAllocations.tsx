import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { TokenAllocation } from '../../../types/tokenAllocation';
import { TextButton } from '../../ui/forms/Button';
import Input from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import TokenAllocationInput from './TokenAllocationInput';

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[];
  supply: BigNumber;
  parentAllocationAmount?: BigNumber;
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
      fieldUpdate([{ address: '', amount: BigNumber.from(0) }], 'tokenAllocations');
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

  useEffect(() => {
    const totalAllocated = tokenAllocations.reduce(
      (prev, cur) => cur.amount.add(prev),
      BigNumber.from(0)
    );
    if (supply.gt(0)) {
      // no DAO token allocation with no parent allocations
      if (totalAllocated.gt(0) && parentAllocationAmount?.lte(0)) {
        setAmountError(supply.lt(totalAllocated));
        // parent tokens allocated but no DAO token allocation
      } else if (totalAllocated.lte(0) && parentAllocationAmount?.gt(0)) {
        setAmountError(supply.lt(parentAllocationAmount));
        // parent tokens allocated with DAO token allocation
      } else if (totalAllocated.gt(0) && parentAllocationAmount?.gt(0)) {
        setAmountError(supply.lt(totalAllocated.add(parentAllocationAmount)));
      } else {
        // no allocation set amount error to false
        setAmountError(false);
      }
    }
  }, [tokenAllocations, supply, parentAllocationAmount, fieldUpdate]);
  return (
    <div>
      <div className=" text-gray-50 pb-2">Token Allocations</div>
      {parentAllocationAmount !== undefined && (
        <InputBox>
          <Input
            type="number"
            value={parentAllocationAmount.toString()}
            onChange={e => fieldUpdate(e.target.value, 'parentAllocationAmount')}
            label="Parent Allocation Amount"
            helperText="Amount of tokens to allocate to parent DAO"
            disabled={false}
            isWholeNumberOnly
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
