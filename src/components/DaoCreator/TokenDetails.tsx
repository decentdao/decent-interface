import { useEffect, useCallback, ChangeEvent } from 'react';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import { TokenAllocation } from '../../types/tokenAllocation';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import TokenAllocations from './TokenAllocations';
import ContentBox from '../ui/ContentBox';

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

function TokenDetails({
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
}: TokenDetailsProps) {
  const allocationsValid = useCallback(() => {
    if (tokenAllocations === undefined || supply === undefined) return true;
    return (
      tokenAllocations
        .map(tokenAllocation => Number(tokenAllocation.amount))
        .reduce((prev, curr) => prev + curr, 0) <= Number(supply)
    );
  }, [tokenAllocations, supply]);

  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  useEffect(() => {
    if (tokenAllocations === undefined) return;

    setNextEnabled(
      name !== undefined &&
        name.trim() !== '' &&
        symbol !== undefined &&
        symbol.trim() !== '' &&
        supply !== undefined &&
        Number(supply) !== 0 &&
        !tokenAllocations.some(tokenAllocation => tokenAllocation.amount === 0) &&
        !tokenAllocations.some(tokenAllocation => tokenAllocation.addressError) &&
        allocationsValid()
    );
  }, [name, setNextEnabled, supply, symbol, tokenAllocations, allocationsValid]);

  /**
   * updates symbol state when typing
   * @validation only allows 5 chars
   *
   * @param event
   */
  const onTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const tokenSymbol = event.target.value;

    if (tokenSymbol.length <= 5) {
      setSymbol(tokenSymbol);
    }
  };
  return (
    <ContentBox>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          label="Token Name"
          helperText="What is your governance token called?"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={symbol}
          onChange={onTokenChange}
          label="Token Symbol"
          helperText="Max: 5 characters"
          disabled={false}
        />
      </InputBox>

      <InputBox>
        <Input
          type="number"
          value={supply}
          onChange={e => setSupply(e.target.value)}
          label="Token Supply"
          helperText="Whole numbers only"
          disabled={false}
          isWholeNumberOnly
          min="0"
        />
      </InputBox>

      <TokenAllocations
        tokenAllocations={tokenAllocations}
        supply={supply}
        setTokenAllocations={setTokenAllocations}
      />
    </ContentBox>
  );
}

export default TokenDetails;
