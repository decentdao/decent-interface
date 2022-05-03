import { useEffect, useCallback, ChangeEvent, useState } from "react";
import ContentBoxTitle from "../../ui/ContentBoxTitle";
import { AllocationInput, TokenAllocation } from "../../../daoData/useDeployDAO";
import Input from "../../ui/forms/Input";
import InputBox from "../../ui/forms/InputBox";
import TokenAllocations from "./TokenAllocations";
import { checkAddress } from "../../../hooks/useAddress";
import { useWeb3 } from "../../../web3";
import ContentBanner from "../../ui/ContentBanner";

interface TokenDetailsProps {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  symbol: string;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  supply: string;
  setSupply: React.Dispatch<React.SetStateAction<string>>;
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
  const [errorMap, setErrorMap] = useState<Map<number, AllocationInput>>(new Map());
  const { provider } = useWeb3();
  
  const allocationsValid = useCallback(() => {
    if (tokenAllocations === undefined || supply === undefined) return true;
    return tokenAllocations.map((tokenAllocation) => Number(tokenAllocation.amount)).reduce((prev, curr) => prev + curr, 0) <= Number(supply);
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
        Number(supply) !== 0 &&
        !tokenAllocations.some((tokenAllocation) => tokenAllocation.amount === 0) &&
        !Array.from(errorMap.values()).some(error => error.error) &&
        allocationsValid()
    );
  }, [name, setNextEnabled, supply, symbol, tokenAllocations, allocationsValid, errorMap]);

  /**
   * updates symbol state when typing
   * @validation only allows 5 chars
   *
   * @param event
   */
  const onTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const symbol = event.target.value;

    if (symbol.length <= 5) {
      setSymbol(symbol);
    }
  };

  /**
   * adds new error to mapping
   * @param key
   * @param error
   */
  const setError = useCallback(
    (key: number, allocation: TokenAllocation, error: string | null) => {
      const errors = new Map(errorMap);
      errors.set(key, { ...allocation, error });
      setErrorMap(errors);
    },
    [errorMap]
  );

  /**
   * removes error to mapping
   * @param key
   * @param error
   */
  const removeError = (key: number) => {
    const errors = new Map(errorMap);
    errors.delete(key);
    setErrorMap(errors);
  };

  useEffect(() => {
    if (!tokenAllocations || !provider) return;
    Promise.all(
      tokenAllocations.map(async (tokenAllocation: { address: string; amount: number }, index: number) => {
        if (errorMap.get(index)?.address === tokenAllocation.address) {
          // do nothing if address at index hasn't changed since last render
          return;
        }
        if (tokenAllocation.address.trim().length) {
          // validates address as valid eth address or ENS domain as sets/removes error
          const isValidAddress = await checkAddress(provider, tokenAllocation.address);
          if (!isValidAddress) {
            return setError(index, tokenAllocation, "Invalid address");
          }
        }
        return setError(index, tokenAllocation, null);
      })
    );
  }, [tokenAllocations, provider, setError, errorMap]);

  return (
    <div>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} label="Token Name" helperText="What is your governance token called?" />
      </InputBox>
      <InputBox>
        <Input type="text" value={symbol} onChange={onTokenChange} label="Token Symbol" helperText="Max: 5 characters" disabled={false} />
      </InputBox>

      <InputBox>
        <Input
          type="number"
          value={supply}
          onChange={(e) => setSupply(e.target.value)}
          label="Token Supply"
          helperText="Whole numbers only"
          disabled={false}
          isWholeNumberOnly
        />
      </InputBox>

      <TokenAllocations tokenAllocations={tokenAllocations} setTokenAllocations={setTokenAllocations} errorMap={errorMap} removeError={removeError} />
      <ContentBanner description="The Governance Setup values are not editable at this time. To change these values, a new proposal will need to be created and passed by your members." />
    </div>
  );
};

export default TokenDetails;
