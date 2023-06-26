import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, CreatorSteps } from '../../types';
interface IStepButtons extends ICreationStepProps {
  nextStep?: CreatorSteps;
  prevStep?: CreatorSteps;
  isLastStep?: boolean;
  isNextDisabled?: boolean;
  isEdit?: boolean;
}

export function StepButtons({
  errors,
  transactionPending,
  isSubmitting,
  step,
  isSubDAO,
  updateStep,
  nextStep,
  prevStep,
  isLastStep,
  isNextDisabled,
  isEdit,
}: IStepButtons) {
  const { t } = useTranslation(['daoCreate', 'common']);

  const forwardButtonText =
    isLastStep && isSubDAO
      ? t('labelDeploySubDAO')
      : isLastStep && isEdit
      ? t('labelDeployAzorius')
      : t(isLastStep ? 'deploy' : 'next', { ns: 'common' });
  const buttonType = isLastStep ? 'submit' : 'button';
  return (
    <Flex alignItems="center">
      {prevStep && (
        <Button
          data-testid="create-prevButton"
          variant="text"
          isDisabled={transactionPending || isSubmitting}
          disabled={true}
          onClick={() => updateStep(prevStep)}
        >
          {t('back', { ns: 'common' })}
        </Button>
      )}
      <Button
        w="full"
        type={buttonType}
        isDisabled={transactionPending || isSubmitting || !!errors[step] || isNextDisabled}
        onClick={() => (!isLastStep && nextStep ? updateStep(nextStep) : {})}
        data-testid={!isLastStep ? 'create-skipNextButton' : 'create-deployDAO'}
      >
        {forwardButtonText}
      </Button>
    </Flex>
  );
}
