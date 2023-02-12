import { Button, Divider, Flex, Input } from '@chakra-ui/react';
import { Field, FieldAttributes } from 'formik';
import { useTranslation } from 'react-i18next';
import { useFormHelpers } from '../../hooks/utils/useFormHelpers';
import { LabelComponent } from '../ProposalCreate/InputComponent';
import ContentBoxTitle from '../ui/containers/ContentBox/ContentBoxTitle';
import { StepWrapper } from './StepWrapper';
import { UsulTokenAllocations } from './UsulTokenAllocations';
import { BigNumberInput } from './refactor/BigNumberInput';
import { ICreationStepProps, CreatorSteps } from './types';

export function UsulTokenDetails(props: ICreationStepProps) {
  const { values, errors, setFieldValue, updateStep } = props;
  const { t } = useTranslation('daoCreate');
  const { restrictChars } = useFormHelpers();
  return (
    <StepWrapper titleKey="titleUsulConfig">
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
          <Field name="govToken.tokenSymbol">
            {({ field }: FieldAttributes<any>) => (
              <Input
                {...field}
                data-testid="tokenVoting-tokenSymbolInput"
              />
            )}
          </Field>
        </LabelComponent>
        <LabelComponent
          label={t('labelTokenSupply')}
          helper={t('helperTokenSupply')}
          isRequired
        >
          <BigNumberInput
            value={values.govToken.tokenSupply.value}
            onChange={valuePair => setFieldValue('govToken.tokenSupply', valuePair)}
            data-testid="tokenVoting-tokenSupplyInput"
            onKeyDown={restrictChars}
          />
        </LabelComponent>
        <UsulTokenAllocations {...props} />
        <Divider color="chocolate.700" />
        <Flex alignItems="center">
          <Button
            data-testid="create-prevButton"
            variant="text"
            onClick={() => updateStep(CreatorSteps.ESSENTIALS)}
          >
            {t('prev', { ns: 'common' })}
          </Button>
          <Button
            w="full"
            disabled={!!errors.govToken}
            onClick={() => updateStep(CreatorSteps.GOV_CONFIG)}
            data-testid="create-skipNextButton"
          >
            {t('next', { ns: 'common' })}
          </Button>
        </Flex>
      </Flex>
    </StepWrapper>
  );
}
