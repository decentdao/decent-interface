import { TokenAllocation } from '../../types/tokenAllocation';
import { TextButton } from '../ui/forms/Button';
import InputBox from '../ui/forms/InputBox';
import TokenAllocationInput from './TokenAllocationInput';

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[];
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
}

function TokenAllocations({ tokenAllocations, setTokenAllocations }: TokenAllocationsProps) {
  const updateTokenAllocation = (index: number, tokenAllocation: TokenAllocation) => {
    const newTokenAllocations = [...tokenAllocations];
    newTokenAllocations[index] = tokenAllocation;
    setTokenAllocations(newTokenAllocations);
  };

  const addTokenAllocation = () => {
    if (tokenAllocations === undefined) {
      setTokenAllocations([{ address: '', amount: 0 }]);
      return;
    }
    setTokenAllocations([
      ...tokenAllocations,
      {
        address: '',
        amount: 0,
      },
    ]);
  };

  const removeTokenAllocation = (index: number) => {
    if (tokenAllocations === undefined) return;
    setTokenAllocations([
      ...tokenAllocations.slice(0, index),
      ...tokenAllocations.slice(index + 1),
    ]);
  };

  return (
    <div>
      <div className=" text-gray-50 pb-2">Token Allocations</div>
      <InputBox>
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-4 md:col-span-5 text-xs text-gray-25">Address</div>
          <div className="col-span-2 text-xs text-gray-25">Amount</div>
          {tokenAllocations &&
            tokenAllocations.map((tokenAllocation, index) => (
              <TokenAllocationInput
                key={index}
                index={index}
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
