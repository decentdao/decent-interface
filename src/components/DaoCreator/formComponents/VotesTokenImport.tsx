import { Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { CreatorSteps, ICreationStepProps } from '../../../types';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { LabelComponent } from '../../ui/forms/InputComponent';
import { StepButtons } from '../StepButtons';

export function VotesTokenImport(props: ICreationStepProps) {
  const { values, handleChange } = props;
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
        disabled={true}
      >
        <Field name="erc20Token.tokenName">
          {({ field }: FieldAttributes<any>) => (
            <Input
              {...field}
              disabled={true}
              data-testid="tokenVoting-tokenNameInput"
              minWidth="50%"
            />
          )}
        </Field>
      </LabelComponent>
      <LabelComponent
        label={t('labelTokenSymbol')}
        helper={t('helperTokenSymbol')}
        isRequired
        disabled={true}
      >
        <Input
          name="erc20Token.tokenSymbol"
          value={values.erc20Token.tokenSymbol}
          onChange={handleChange}
          data-testid="tokenVoting-tokenSymbolInput"
          disabled={true}
        />
      </LabelComponent>
      <LabelComponent
        label={t('labelTokenSupply')}
        helper={t('helperTokenSupply')}
        isRequired
        disabled={true}
      >
        <Input
          value={values.token.tokenSupply.bigNumberValue?.toString()}
          onChange={handleChange}
          data-testid="tokenVoting-tokenSupplyInput"
          disabled={true}
        />
      </LabelComponent>
      <StepButtons
        {...props}
        prevStep={CreatorSteps.ESSENTIALS}
        nextStep={CreatorSteps.AZORIUS_DETAILS}
      />
    </Flex>
  );
}
