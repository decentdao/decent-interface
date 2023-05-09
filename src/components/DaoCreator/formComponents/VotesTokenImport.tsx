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
        <Field name="govToken.tokenName">
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
          name="govToken.tokenSymbol"
          value={values.token.tokenSymbol}
          onChange={handleChange}
          maxLength={6}
          data-testid="tokenVoting-tokenSymbolInput"
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
