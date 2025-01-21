import { Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { isFeatureEnabled } from '../../../helpers/featureFlags';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigIntInput } from '../../ui/forms/BigIntInput';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { CreateDAOPresenter } from '../presenters/CreateDAOPresenter';
import { InputSection } from './input/InputSection';
import { BigIntTextInput, TextInput } from './input/TextInput';

export function VotesTokenNew(props: ICreationStepProps) {
  const { values, handleChange, setFieldValue } = props;
  const { t } = useTranslation('daoCreate');
  const { restrictChars } = useFormHelpers();

  if (isFeatureEnabled('flag_higher_components')) {
    const tokenName = CreateDAOPresenter.tokenName(t, false, value => {
      setFieldValue('erc20Token.tokenName', value);
    });
    const tokenSymbol = CreateDAOPresenter.tokenSymbol(t, false, event => {
      handleChange(event);
    });
    const tokenSupply = CreateDAOPresenter.tokenSupply(
      t,
      values.erc20Token.tokenSupply.bigintValue,
      false,
      value => {
        setFieldValue('erc20Token.tokenSupply', value);
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
  } else {
    return (
      <Flex
        flexDirection="column"
        gap={8}
      >
        <ContentBoxTitle>{t('titleTokenParams')}</ContentBoxTitle>
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
      </Flex>
    );
  }
}
