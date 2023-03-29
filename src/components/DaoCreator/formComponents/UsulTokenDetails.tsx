import { Divider, Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../../hooks/utils/useFormHelpers';
import { ICreationStepProps, CreatorSteps } from '../../../types';
import { LabelComponent } from '../../ui/forms/InputComponent';
import ContentBoxTitle from '../../ui/containers/ContentBox/ContentBoxTitle';
import { BigNumberInput } from '../../ui/forms/BigNumberInput';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import { UsulTokenAllocations } from './UsulTokenAllocations';

export function UsulTokenDetails(props: ICreationStepProps) {
  const { values, isSubmitting, transactionPending, handleChange, isSubDAO, setFieldValue } = props;
  const { t } = useTranslation('daoCreate');
  const { restrictChars } = useFormHelpers();
  return (
    <StepWrapper
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleUsulConfig"
    >
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
          <Field name="govToken.tokenName">
            {({ field }: FieldAttributes<any>) => (
              <Input
                {...field}
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
        >
          <Input
            name="govToken.tokenSymbol"
            value={values.govToken.tokenSymbol}
            onChange={handleChange}
            maxLength={6}
            data-testid="tokenVoting-tokenSymbolInput"
          />
        </LabelComponent>
        <LabelComponent
          label={t('labelTokenSupply')}
          helper={t('helperTokenSupply')}
          isRequired
        >
          <BigNumberInput
            value={values.govToken.tokenSupply.bigNumberValue}
            onChange={valuePair => setFieldValue('govToken.tokenSupply', valuePair)}
            data-testid="tokenVoting-tokenSupplyInput"
            onKeyDown={restrictChars}
          />
        </LabelComponent>
        <Divider color="chocolate.700" />
        <UsulTokenAllocations {...props} />
        <Divider
          color="chocolate.700"
          mb={4}
        />
        <StepButtons
          {...props}
          prevStep={CreatorSteps.ESSENTIALS}
          nextStep={CreatorSteps.GOV_CONFIG}
        />
      </Flex>
    </StepWrapper>
  );
}
