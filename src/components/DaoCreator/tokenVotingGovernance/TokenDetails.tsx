import ContentBoxTitle from '../../ui/ContentBoxTitle';
import Input, { RestrictCharTypes } from '../../ui/forms/Input';
import InputBox from '../../ui/forms/InputBox';
import TokenAllocations from './TokenAllocations';
import ContentBox from '../../ui/ContentBox';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import { useFractal } from '../../../providers/fractal/hooks/useFractal';
import { utils } from 'ethers';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';

function TokenDetails() {
  const {
    state: { govToken },
    dispatch,
  } = useCreator();

  const {
    modules: { gnosisWrapperModule },
  } = useFractal();

  const fieldUpdate = (value: any, field: string) => {
    dispatch({
      type: CreatorProviderActions.UPDATE_TREASURY_GOV_TOKEN,
      payload: {
        [field]: value,
      },
    });
  };

  const onSupplyChange = (value: string) => {
    fieldUpdate(
      { value, bigNumberValue: utils.parseUnits(value || '0', DEFAULT_TOKEN_DECIMALS) },
      'tokenSupply'
    );
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
          maxLength={5}
        />
      </InputBox>
      <InputBox>
        <Input
          type="number"
          value={govToken.tokenSupply.value}
          onChange={e => onSupplyChange(e.target.value)}
          label="Token Supply"
          helperText="Max: 18 decimals"
          decimals={DEFAULT_TOKEN_DECIMALS}
          restrictChar={RestrictCharTypes.FLOAT_NUMBERS}
        />
      </InputBox>
      <TokenAllocations
        tokenAllocations={govToken.tokenAllocations}
        supply={govToken.tokenSupply.bigNumberValue}
        parentAllocationAmount={govToken.parentAllocationAmount}
        canReceiveParentAllocations={!gnosisWrapperModule}
        fieldUpdate={fieldUpdate}
      />
    </ContentBox>
  );
}

export default TokenDetails;
