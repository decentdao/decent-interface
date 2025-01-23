import { useTranslation } from 'react-i18next';
import { ICreationStepProps, TokenCreationType } from '../../../types';
import { InputSection } from '../../input/InputSection';
import { TextInput, BigIntTextInput } from '../../input/TextInput';
import { CreateDAOPresenter } from '../presenters/CreateDAOPresenter';

export function VotesToken(props: ICreationStepProps) {
  const { values, handleChange, setFieldValue } = props;
  const { t } = useTranslation('daoCreate');

  const newToken = values.erc20Token.tokenCreationType == TokenCreationType.NEW;

  const tokenName = CreateDAOPresenter.tokenName(t, !newToken, value => {
    if (newToken) {
      setFieldValue('erc20Token.tokenName', value);
    }
  });
  const tokenSymbol = CreateDAOPresenter.tokenSymbol(t, !newToken, event => {
    if (newToken) {
      handleChange(event);
    }
  });
  const tokenSupply = CreateDAOPresenter.tokenSupply(
    t,
    values.erc20Token.tokenSupply.bigintValue,
    !newToken,
    value => {
      if (newToken) {
        setFieldValue('erc20Token.tokenSupply', value);
      }
    },
  );

  const section = CreateDAOPresenter.section(t('titleTokenParams'));
  return (
    <InputSection {...section}>
      <TextInput {...tokenName} />
      <TextInput {...tokenSymbol} />
      <BigIntTextInput {...tokenSupply} />
    </InputSection>
  );
}
