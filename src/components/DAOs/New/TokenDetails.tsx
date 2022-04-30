import { useEffect, useState, useCallback } from "react";
import ContentBoxTitle from "../../ui/ContentBoxTitle";
import { TokenAllocation } from "../../../daoData/useDeployDAO";
import { ethers } from "ethers";
import Input from "../../ui/forms/Input";
import InputBox from "../../ui/forms/InputBox";
import TokenAllocations from "./TokenAllocations";

interface TokenDetailsProps {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  symbol: string;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  supply: number;
  setSupply: React.Dispatch<React.SetStateAction<number>>;
  tokenAllocations: TokenAllocation[];
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
}

const TokenDetails = ({
  name,
  symbol,
  supply,
  tokenAllocations,
  setName,
  setSymbol,
  setSupply,
  setTokenAllocations,
  setPrevEnabled,
  setNextEnabled,
}: TokenDetailsProps) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const allocationsValid = useCallback(() => {
    if (tokenAllocations === undefined || supply === undefined) return true;
    return tokenAllocations.map((tokenAllocation) => tokenAllocation.amount).reduce((prev, curr) => prev + curr, 0) <= supply;
  }, [tokenAllocations, supply]);

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
        !tokenAllocations.some((tokenAllocation) => !ethers.utils.isAddress(tokenAllocation.address) || tokenAllocation.amount === 0) &&
        allocationsValid()
    );
  }, [name, setNextEnabled, supply, symbol, tokenAllocations, allocationsValid]);

  useEffect(() => {
    if (tokenAllocations === undefined) return;

    if (tokenAllocations.some((tokenAllocation) => tokenAllocation.address !== "" && !ethers.utils.isAddress(tokenAllocation.address))) {
      setErrorMessage("Invalid address");
    } else if (!allocationsValid()) {
      setErrorMessage("Invalid token allocations");
    } else {
      setErrorMessage(undefined);
    }
  }, [tokenAllocations, allocationsValid]);

  return (
    <div>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} label="Token Name" helperText="What is your governance token called?" />
      </InputBox>
      <InputBox>
        <Input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} label="Token Symbol" helperText="Max: 5 chars" disabled={false} />
      </InputBox>

      <InputBox>
        <Input
          type="number"
          value={supply || undefined}
          onChange={(e) => setSupply(Number(e))}
          label="Token Supply"
          helperText="Whole numbers only"
          disabled={false}
        />
      </InputBox>

      <TokenAllocations tokenAllocations={tokenAllocations} setTokenAllocations={setTokenAllocations} errorMessage={errorMessage} />
    </div>
  );
};

export default TokenDetails;
