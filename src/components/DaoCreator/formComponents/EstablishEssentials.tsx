import { Box, Divider, Input, RadioGroup } from '@chakra-ui/react';
import { LabelWrapper } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, CreatorSteps, GovernanceModuleType } from '../../../types';
import { InputComponent, LabelComponent } from '../../ui/forms/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export function EstablishEssentials(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate', 'common']);
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO, errors } = props;
  // @todo update labels for subDAOs

  return (
    <StepWrapper
      isSubDAO={isSubDAO}
      isFormSubmitting={!!isSubmitting || transactionPending}
      titleKey="titleEssentials"
    >
      <InputComponent
        label={t('labelFractalName')}
        helper={t('helperFractalName')}
        isRequired
        value={values.essentials.daoName}
        id="searchEssentials-daoName"
        onChange={cEvent => setFieldValue('essentials.daoName', cEvent.target.value, true)}
        onBlur={cEvent => setFieldValue('essentials.daoName', cEvent.target.value.trim(), true)}
        disabled={false}
        placeholder={t('daoNamePlaceholder')}
        testId="essentials-daoName"
      />
      <Box my={8}>
        <LabelComponent
          label={t('labelChooseGovernance')}
          helper={t('helperChooseGovernance')}
          isRequired
        >
          <RadioGroup
            bg="black.900-semi-transparent"
            px={8}
            py={4}
            rounded="md"
            display="flex"
            flexDirection="column"
            name="governance"
            gap={4}
            id="governance"
            value={values.essentials.governance}
            onChange={value => setFieldValue('essentials.governance', value)}
          >
            <RadioWithText
              label={t('labelMultisigGov')}
              description={t('descMultisigGov')}
              testId="choose-multisig"
              value={GovernanceModuleType.MULTISIG}
            />
            <RadioWithText
              label={t('labelAzoriusGov')}
              description={t('descAzoriusGov')}
              testId="choose-azorius"
              value={GovernanceModuleType.AZORIUS}
            />
          </RadioGroup>
        </LabelComponent>
      </Box>
      <Divider
        color="chocolate.700"
        mb={4}
      />
      <LabelComponent
        label={t('snapshot')}
        helper={t('snapshotHelper')}
        isRequired={false}
      >
        <LabelWrapper errorMessage={errors?.essentials?.snapshotURL}>
          <Input
            id="searchEssentials-snapshotURL"
            value={values.essentials.snapshotURL}
            onChange={cEvent => setFieldValue('essentials.snapshotURL', cEvent.target.value, true)}
            isDisabled={false}
            data-testid="essentials-snapshotURL"
            placeholder="fractaldao.eth"
            maxLength={30}
          />
        </LabelWrapper>
      </LabelComponent>
      <Divider
        color="chocolate.700"
        mb={4}
      />
      <StepButtons
        {...props}
        nextStep={
          values.essentials.governance === GovernanceModuleType.MULTISIG
            ? CreatorSteps.MULTISIG_DETAILS
            : CreatorSteps.TOKEN_DETAILS
        }
      />
    </StepWrapper>
  );
}
