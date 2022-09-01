import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import TokenAllocations from './TokenAllocations';
import ContentBox from '../../ui/ContentBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import { formatStrToBigNumber } from '../../../helpers';

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

  const onSupplyChange = (value: string) => {
    fieldUpdate({ value, valueBN: formatStrToBigNumber(value || '0') }, 'tokenSupply');
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
          value={govToken.tokenSupply.value}
          onChange={e => onSupplyChange(e.target.value)}
          label="Token Supply"
          helperText=" "
          disabled={false}
        />
      </InputBox>
      <TokenAllocations
        tokenAllocations={govToken.tokenAllocations}
        supply={govToken.tokenSupply.valueBN}
        parentAllocationAmount={govToken.parentAllocationAmount}
        fieldUpdate={fieldUpdate}
      />
    </ContentBox>
  );
}

export default TokenDetails;
