import { Box, Divider, RadioGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, StrategyType, CreatorSteps } from '../../../types';
import { InputComponent, LabelComponent } from '../../ProposalCreate/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';

export function EstablishEssentials(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate', 'common']);
  const { values, setFieldValue, isSubmitting, transactionPending, isSubDAO } = props;
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
              value={StrategyType.GNOSIS_SAFE}
            />
            <RadioWithText
              label={t('labelUsulGov')}
              description={t('descUsulGov')}
              testId="choose-usul"
              value={StrategyType.GNOSIS_SAFE_USUL}
            />
          </RadioGroup>
        </LabelComponent>
      </Box>
      <Divider
        color="chocolate.700"
        mb={4}
      />
      <StepButtons
        {...props}
        nextStep={
          values.essentials.governance === StrategyType.GNOSIS_SAFE
            ? CreatorSteps.GNOSIS_GOVERNANCE
            : CreatorSteps.GNOSIS_WITH_USUL
        }
      />
    </StepWrapper>
  );
}
