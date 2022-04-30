import { TokenAllocation } from "../../../daoData/useDeployDAO";
import TokenAllocationInput from "./TokenAllocationInput";

interface TokenAllocationsProps {
  tokenAllocations: TokenAllocation[] | undefined;
  errorMessage: string | undefined;
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[] | undefined>>;
}
const TokenAllocations = ({ tokenAllocations, setTokenAllocations, errorMessage }: TokenAllocationsProps) => {
  const updateTokenAllocation = (index: number, tokenAllocation: TokenAllocation) => {
    if (tokenAllocations === undefined) {
      setTokenAllocations(undefined);
      return;
    }

    const newTokenAllocations = [...tokenAllocations];
    newTokenAllocations[index] = tokenAllocation;

    setTokenAllocations(newTokenAllocations);
  };

  const addTokenAllocation = () => {
    if (tokenAllocations === undefined) {
      setTokenAllocations([{ address: "", amount: 0 }]);
      return;
    }

    setTokenAllocations([
      ...tokenAllocations,
      {
        address: "",
        amount: 0,
      },
    ]);
  };

  const removeTokenAllocation = (index: number) => {
    if (tokenAllocations === undefined) return;

    setTokenAllocations([...tokenAllocations.slice(0, index), ...tokenAllocations.slice(index + 1)]);
  };

  return (
    <div className="bg-gray-500 rounded-lg my-4">
      <div className="px-4 py-4">
        <div className="text-sm text-gray-50 pb-2">Token Allocations</div>
        <div className="md:grid md:grid-cols-12 md:gap-4 flex flex-col items-center">
          <div className="md:col-span-8 text-sm text-gray-50">Address</div>
          <div className="md:col-span-3 text-sm text-gray-50">Amount</div>
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
        <div className="text-sm text-gray-50 underline cursor-pointer my-4" onClick={() => addTokenAllocation()}>
          Add Allocation
        </div>
        {errorMessage && <div className="text-center text-sm text-white">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default TokenAllocations;
