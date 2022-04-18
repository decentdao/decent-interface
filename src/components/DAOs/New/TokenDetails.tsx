import { useEffect } from 'react';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import CreateDAOInput from '../../ui/CreateDAOInput';

const TokenDetails = ({
  setPrevEnabled,
  setNextEnabled,
  name,
  setName,
  symbol,
  setSymbol,
  supply,
  setSupply,
}: {
  setPrevEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  setNextEnabled: React.Dispatch<React.SetStateAction<boolean>>,
  name: string | undefined,
  setName: React.Dispatch<React.SetStateAction<string | undefined>>,
  symbol: string | undefined,
  setSymbol: React.Dispatch<React.SetStateAction<string | undefined>>,
  supply: number | undefined,
  setSupply: React.Dispatch<React.SetStateAction<number | undefined>>,
}) => {
  useEffect(() => {
    setPrevEnabled(true);
  }, [setPrevEnabled]);

  useEffect(() => {
    setNextEnabled(
      name !== undefined && name.trim() !== "" &&
      symbol !== undefined && symbol.trim() !== "" &&
      supply !== undefined && supply !== 0
    );
  }, [name, setNextEnabled, supply, symbol]);

  return (
    <div>
      <ContentBoxTitle>
        Mint a New Token
      </ContentBoxTitle>
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
        onChange={e => setSupply(Number(e))}
        label="Token Supply"
        helperText="Whole numbers only"
        disabled={false}
      />
    </div>
  );
}

export default TokenDetails;
