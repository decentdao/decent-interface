import { Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { LabelComponent } from '../../ui/forms/InputComponent';

export function VotesTokenImport({ values, handleChange }: ICreationStepProps) {
  const { t } = useTranslation('daoCreate');
  return (
    <Flex
      flexDirection="column"
      gap={8}
    >
      <ContentBoxTitle>{t('titleTokenParams')}</ContentBoxTitle>
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
              disabled
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
          data-testid="tokenVoting-tokenSymbolInput"
          placeholder="TKN"
          disabled
        />
      </LabelComponent>
      <LabelComponent
        label={t('labelTokenSupply')}
        helper={t('helperTokenSupply')}
        isRequired
      >
        <Input
          value={values.erc20Token.tokenSupply.bigintValue?.toString()}
          disabled
          onChange={handleChange}
          data-testid="tokenVoting-tokenSupplyInput"
          placeholder="100,000,000"
        />
      </LabelComponent>
    </Flex>
  );
}
