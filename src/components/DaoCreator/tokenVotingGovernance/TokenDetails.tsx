import { Input, NumberInput, NumberInputField } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import ContentBox from '../../ui/ContentBox';
import ContentBoxTitle from '../../ui/ContentBoxTitle';
import InputBox from '../../ui/forms/InputBox';
import { DEFAULT_TOKEN_DECIMALS } from '../provider/constants';
import { useCreator } from '../provider/hooks/useCreator';
import { CreatorProviderActions } from '../provider/types';
import TokenAllocations from './TokenAllocations';

function TokenDetails() {
  const {
    state: { govToken },
    dispatch,
  } = useCreator();

  const { limitDecimalsOnKeyDown } = useFormHelpers();

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

  const { t } = useTranslation('daoCreate');

  return (
    <ContentBox>
      {/* @todo add translations */}
      <ContentBoxTitle>Mint a New Token</ContentBoxTitle>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenName')}
          subLabel={t('helperTokenName')}
        >
          <Input
            data-testid="tokenVoting-tokenNameInput"
            value={govToken.tokenName}
            onChange={e => fieldUpdate(e.target.value, 'tokenName')}
            minWidth="50%"
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenSymbol')}
          subLabel={t('helperTokenSymbol')}
        >
          <Input
            data-testid="tokenVoting-tokenSymbolInput"
            value={govToken.tokenSymbol}
            onChange={e => fieldUpdate(e.target.value, 'tokenSymbol')}
          />
        </LabelWrapper>
      </InputBox>
      <InputBox>
        <LabelWrapper
          label={t('labelTokenSupply')}
          subLabel={t('helperTokenSupply')}
        >
          <NumberInput
            data-testid="tokenVoting-tokenSupplyInput"
            value={govToken.tokenSupply.value}
            onChange={tokenSupply => onSupplyChange(tokenSupply)}
            onKeyDown={e => limitDecimalsOnKeyDown(e, govToken.tokenSupply.value, 4)}
          >
            <NumberInputField />
          </NumberInput>
        </LabelWrapper>
      </InputBox>
      <TokenAllocations
        tokenAllocations={govToken.tokenAllocations}
        supply={govToken.tokenSupply.bigNumberValue}
        parentAllocationAmount={govToken.parentAllocationAmount}
        // @todo parent allocations should be reenabled when code is implemented
        canReceiveParentAllocations={false}
        fieldUpdate={fieldUpdate}
      />
    </ContentBox>
  );
}

export default TokenDetails;
