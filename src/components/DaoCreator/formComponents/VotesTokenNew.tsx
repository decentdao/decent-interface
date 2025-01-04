import { Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { FeatureFlags } from '../../../helpers/featureFlags';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { CreateDAOPresenter } from '../presenters/CreateDAOPresenter';
import { BigIntTextInput, TextInput } from './TextInput';

export function VotesTokenNew(props: ICreationStepProps) {
  const { values, handleChange, setFieldValue } = props;
  const { t } = useTranslation('daoCreate');
  const { restrictChars } = useFormHelpers();

  const REUSABLE_COMPONENTS = FeatureFlags.instance?.get('REUSABLE_COMPONENTS') == true;
  const tokenName = CreateDAOPresenter.tokenName(t, values.erc20Token.tokenName, value => {
    setFieldValue('erc20Token.tokenName', value);
  });
  const tokenSymbol = CreateDAOPresenter.tokenSymbol(t, values.erc20Token.tokenSymbol, event => {
    handleChange(event);
  });
  const tokenSupply = CreateDAOPresenter.tokenSupply(
    t,
    values.erc20Token.tokenSupply.bigintValue,
    value => {
      setFieldValue('erc20Token.tokenSupply', value);
    },
  );

  return (
    <Flex
      flexDirection="column"
      gap={8}
    >
      <ContentBoxTitle>{t('titleTokenParams')}</ContentBoxTitle>
      {REUSABLE_COMPONENTS && (
        <>
          <TextInput {...tokenName} />
          <TextInput {...tokenSymbol} />
          <BigIntTextInput {...tokenSupply} />
        </>
      )}
      {!REUSABLE_COMPONENTS && (
        <>
          <LabelComponent
            label={t('labelTokenName')}
            helper={t('helperTokenName')}
            isRequired
          >
            <Field name="erc20Token.tokenName">
              {({ field }: FieldAttributes<any>) => (
                <Input
                  {...field}
                  data-testid="tokenVoting-tokenNameInput"
                  minWidth="50%"
                  placeholder="Name"
                />
              )}
            </Field>
          </LabelComponent>
          <LabelComponent
            label={t('labelTokenSymbol')}
            helper={t('helperTokenSymbol')}
            isRequired
          >
            <Input
              name="erc20Token.tokenSymbol"
              value={values.erc20Token.tokenSymbol}
              onChange={handleChange}
              maxLength={6}
              data-testid="tokenVoting-tokenSymbolInput"
              placeholder="TKN"
            />
          </LabelComponent>
          <LabelComponent
            label={t('labelTokenSupply')}
            helper={t('helperTokenSupply')}
            isRequired
          >
            <BigIntInput
              value={values.erc20Token.tokenSupply.bigintValue}
              onChange={valuePair => setFieldValue('erc20Token.tokenSupply', valuePair)}
              data-testid="tokenVoting-tokenSupplyInput"
              onKeyDown={restrictChars}
              placeholder="100,000,000"
            />
          </LabelComponent>
        </>
      )}
    </Flex>
  );
}
