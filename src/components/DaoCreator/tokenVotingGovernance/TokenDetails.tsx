import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import TokenAllocations from './TokenAllocations';
import ContentBox from '../../ui/ContentBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';

function TokenDetails() {
  const {
    state: { govToken },
    dispatch,
  } = useCreator();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN,
      payload: {
        [field]: value,
      },
    });
  };
  return (
    <ContentBox>
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <Input
          type="text"
          value={govToken.tokenName}
          onChange={e => fieldUpdate(e.target.value, 'tokenName')}
          label="Token Name"
          helperText="What is your governance token called?"
        />
      </InputBox>
      <InputBox>
        <Input
          type="text"
          value={govToken.tokenSymbol}
          onChange={e => fieldUpdate(e.target.value, 'tokenSymbol')}
          label="Token Symbol"
          helperText="Max: 5 characters"
          disabled={false}
        />
      </InputBox>

      <InputBox>
        <Input
          type="number"
          value={govToken.tokenSupply}
          onChange={e => fieldUpdate(e.target.value, 'tokenSupply')}
          label="Token Supply"
          helperText="Whole numbers only"
          disabled={false}
          isWholeNumberOnly
          min="0"
        />
      </InputBox>

      <TokenAllocations
        tokenAllocations={govToken.tokenAllocations}
        supply={govToken.tokenSupply}
        parentAllocationAmount={govToken.parentAllocationAmount}
        fieldUpdate={fieldUpdate}
      />
    </ContentBox>
  );
}

export default TokenDetails;
