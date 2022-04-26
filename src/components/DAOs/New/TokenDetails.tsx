import { useEffect, useState } from "react";
import ContentBoxTitle from "../../ui/ContentBoxTitle";
import CreateDAOInput from "../../ui/CreateDAOInput";
import { TokenAllocation } from "./index";
import { ethers } from "ethers";

const TokenAllocationInput = ({
  index,
  tokenAllocation,
  updateTokenAllocation,
}: {
  index: number;
  tokenAllocation: TokenAllocation;
  updateTokenAllocation: (
    index: number,
    tokenAllocation: TokenAllocation
  ) => void;
}) => {
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
        className="md:col-span-2 w-full border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50"
        type="string"
        value={tokenAllocation.address || ""}
        onChange={(event) => updateAddress(event.target.value)}
      />
      <input
        className="md:pt-0 border border-gray-200 bg-gray-400 rounded py-1 px-2 text-gray-50"
        type="number"
        value={tokenAllocation.amount || ""}
        onChange={(event) => updateAmount(event.target.value)}
      />
    </>
  );
};

const TokenAllocations = ({
  tokenAllocations,
  setTokenAllocations,
  tokenSupply,
}: {
  tokenAllocations: TokenAllocation[] | undefined;
  setTokenAllocations: React.Dispatch<
    React.SetStateAction<TokenAllocation[] | undefined>
  >;
  tokenSupply: number | undefined;
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if(tokenAllocations === undefined || tokenSupply === undefined) return;

    if(tokenAllocations.some(
      (tokenAllocation) =>
        tokenAllocation.address !== "" && !ethers.utils.isAddress(tokenAllocation.address)
    )) {
      setErrorMessage("Invalid address");
    } else if(
      tokenAllocations
      .map((tokenAllocation) => tokenAllocation.amount)
      .reduce((prev, curr) => prev + curr, 0) > tokenSupply
    ) {
      setErrorMessage("Invalid token allocations")
    } else {
      setErrorMessage(undefined);
    }
  }, [tokenAllocations, tokenSupply]);

  const updateTokenAllocation = (
    index: number,
    tokenAllocation: TokenAllocation
  ) => {
    if (tokenAllocations === undefined) {
      setTokenAllocations(undefined);
      return;
    }

    const newTokenAllocations: TokenAllocation[] = tokenAllocations.map(
      (tokenAllocation) => tokenAllocation
    );
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

  return (
    <div className="bg-gray-500 rounded-lg my-4">
      <div className="px-4 py-4">
        <div className="text-sm text-gray-50 pb-2">Token Allocations</div>
        <div className="md:grid md:grid-cols-3 md:gap-4 flex flex-col items-center">
          <div className="md:col-span-2 text-sm text-gray-50">Address</div>
          <div className="md:pt-0 text-sm text-gray-50">Amount</div>
          {tokenAllocations
            ? tokenAllocations.map((tokenAllocation, index) => (
                <TokenAllocationInput
                  key={index}
                  index={index}
                  tokenAllocation={tokenAllocation}
                  updateTokenAllocation={updateTokenAllocation}
                />
              ))
            : null}
          <div
            className="text-sm text-gray-50 underline cursor-pointer"
            onClick={() => addTokenAllocation()}
          >
            Add Allocation
          </div>
          {errorMessage ? (
            <div className="text-sm text-white">{errorMessage}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const TokenDetails = ({
  setPrevEnabled,
  setNextEnabled,
  name,
  setName,
  symbol,
  setSymbol,
  supply,
  setSupply,
  tokenAllocations,
  setTokenAllocations,
  tokenSupply,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  name: string | undefined;
  setName: React.Dispatch<React.SetStateAction<string | undefined>>;
  symbol: string | undefined;
  setSymbol: React.Dispatch<React.SetStateAction<string | undefined>>;
  supply: number | undefined;
  setSupply: React.Dispatch<React.SetStateAction<number | undefined>>;
  tokenAllocations: TokenAllocation[] | undefined;
  setTokenAllocations: React.Dispatch<
    React.SetStateAction<TokenAllocation[] | undefined>
  >;
  tokenSupply: number | undefined;
}) => {
  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  useEffect(() => {
    if (tokenAllocations === undefined) return;

    setNextEnabled(
      name !== undefined &&
        name.trim() !== "" &&
        symbol !== undefined &&
        symbol.trim() !== "" &&
        supply !== undefined &&
        supply !== 0 &&
        !tokenAllocations.some(
          (tokenAllocation) =>
            !ethers.utils.isAddress(tokenAllocation.address) ||
            tokenAllocation.amount === undefined ||
            tokenAllocation.amount === 0
        ) &&
        tokenSupply !== undefined &&
        tokenAllocations
          .map((tokenAllocation) => tokenAllocation.amount)
          .reduce((prev, curr) => prev + curr, 0) <= tokenSupply
    );
  }, [name, setNextEnabled, supply, symbol, tokenAllocations, tokenSupply]);

  return (
    <div>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <CreateDAOInput
        dataType="text"
        value={name}
        onChange={setName}
        label="Token Name"
        helperText="What is your governance token called?"
        disabled={false}
      />

      <CreateDAOInput
        dataType="text"
        value={symbol}
        onChange={setSymbol}
        label="Token Symbol"
        helperText="Max: 5 chars"
        disabled={false}
      />

      <CreateDAOInput
        dataType="number"
        value={supply?.toString()}
        onChange={(e) => setSupply(Number(e))}
        label="Token Supply"
        helperText="Whole numbers only"
        disabled={false}
      />

      <TokenAllocations
        tokenAllocations={tokenAllocations}
        setTokenAllocations={setTokenAllocations}
        tokenSupply={tokenSupply}
      />
    </div>
  );
};

export default TokenDetails;
