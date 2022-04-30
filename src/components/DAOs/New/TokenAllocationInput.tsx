import { TokenAllocation } from "../../../daoData/useDeployDAO";
import { TextButton } from '../../ui/forms/Button';

interface TokenAllocationProps {
  index: number;
  tokenAllocation: TokenAllocation;
  updateTokenAllocation: (index: number, tokenAllocation: TokenAllocation) => void;
  removeTokenAllocation: (index: number) => void;
}

const TokenAllocationInput = ({ index, tokenAllocation, updateTokenAllocation, removeTokenAllocation }: TokenAllocationProps) => {
  const updateAddress = (address: string) => {
    updateTokenAllocation(index, {
      address: address,
      amount: tokenAllocation.amount,
    });
  };

  const updateAmount = (amount: string) => {
    updateTokenAllocation(index, {
      address: tokenAllocation.address,
      amount: Number(amount),
    });
  };

  return (
    <>
      <input
        className="col-start-1 col-span-4 md:col-span-5 w-full border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50 focus:outline-none"
        type="string"
        value={tokenAllocation.address || ""}
        onChange={(event) => updateAddress(event.target.value)}
      />
      <input
        className="col-span-2 md:pt-0 border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50 focus:outline-none"
        type="number"
        value={tokenAllocation.amount || ""}
        onChange={(event) => updateAmount(event.target.value)}
      />
      <div className="md:col-span-1">
        <TextButton onClick={() => removeTokenAllocation(index)} label="Remove" className="px-0 mx-0" />
      </div>
    </>
  );
};

export default TokenAllocationInput;
