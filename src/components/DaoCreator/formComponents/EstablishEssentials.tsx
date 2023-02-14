import { Box, RadioGroup } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { GovernanceTypes } from '../../../providers/Fractal/types';
import { InputComponent, LabelComponent } from '../../ProposalCreate/InputComponent';
import { RadioWithText } from '../../ui/forms/Radio/RadioWithText';
import { StepButtons } from '../StepButtons';
import { StepWrapper } from '../StepWrapper';
import { ICreationStepProps, CreatorSteps } from '../types';

export function EstablishEssentials(props: ICreationStepProps) {
  const { t } = useTranslation(['daoCreate', 'common']);
  const { values, setFieldValue } = props;
  // @todo update labels for subDAOs
  return (
    <StepWrapper titleKey="titleEssentials">
      <InputComponent
        label={t('labelFractalName')}
        helper={t('helperFractalName')}
        isRequired={true}
        value={values.essentials.daoName}
        id="searchEssentials-daoName"
        onChange={cEvent => setFieldValue('essentials.daoName', cEvent.target.value, true)}
        disabled={false}
        placeholder={t('daoNamePlaceholder')}
        testId="essentials-daoName"
      />
      <Box my={8}>
        <LabelComponent
          label={'labelChooseGovernance'}
          helper={'helperChooseGovernance'}
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
              value={GovernanceTypes.GNOSIS_SAFE}
            />
            <RadioWithText
              label={t('labelUsulGov')}
              description={t('descUsulGov')}
              testId="choose-usul"
              value={GovernanceTypes.GNOSIS_SAFE_USUL}
            />
          </RadioGroup>
        </LabelComponent>
      </Box>
      <StepButtons
        {...props}
        nextStep={
          values.essentials.governance === GovernanceTypes.GNOSIS_SAFE
            ? CreatorSteps.GNOSIS_GOVERNANCE
            : CreatorSteps.GNOSIS_WITH_USUL
        }
      />
    </StepWrapper>
  );
}
