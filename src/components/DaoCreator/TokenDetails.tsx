import { useEffect, ChangeEvent } from 'react';
import ContentBoxTitle from '../ui/ContentBoxTitle';
import { TokenAllocation } from '../../types/tokenAllocation';
import Input from '../ui/forms/Input';
import InputBox from '../ui/forms/InputBox';
import TokenAllocations from './TokenAllocations';

interface TokenDetailsProps {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  symbol: string;
  setSymbol: React.Dispatch<React.SetStateAction<string>>;
  tokenAllocations: TokenAllocation[];
  setTokenAllocations: React.Dispatch<React.SetStateAction<TokenAllocation[]>>;
}

function TokenDetails({
  name,
  symbol,
  tokenAllocations,
  setName,
  setSymbol,
  setTokenAllocations,
  setPrevEnabled,
  setNextEnabled,
}: TokenDetailsProps) {
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
        !tokenAllocations.some(tokenAllocation => tokenAllocation.amount === 0) &&
        !tokenAllocations.some(tokenAllocation => tokenAllocation.addressError)
    );
  }, [name, setNextEnabled, symbol, tokenAllocations]);

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
    <div>
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

      <TokenAllocations
        tokenAllocations={tokenAllocations}
        setTokenAllocations={setTokenAllocations}
      />
    </div>
  );
}

export default TokenDetails;
