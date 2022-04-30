import { TokenAllocation } from "../../../daoData/useDeployDAO";
import Button from "../../ui/Button";

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
        className="md:col-span-8 w-full border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50 focus:outline-none"
        type="string"
        value={tokenAllocation.address || ""}
        onChange={(event) => updateAddress(event.target.value)}
      />
      <input
        className="md:col-span-3 md:pt-0 border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50 focus:outline-none"
        type="number"
        value={tokenAllocation.amount || ""}
        onChange={(event) => updateAmount(event.target.value)}
      />
      <div className="md:col-span-1">
        <Button onClick={() => removeTokenAllocation(index)} addedClassNames="px-2 mx-1 border-gold-300 bg-chocolate-500 text-gold-300">
          X
        </Button>
      </div>
    </>
  );
};

export default TokenAllocationInput;
