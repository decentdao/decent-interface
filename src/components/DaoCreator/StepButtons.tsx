import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ICreationStepProps, CreatorSteps } from '../../types';
interface IStepButtons extends ICreationStepProps {
  nextStep?: CreatorSteps;
  prevStep?: CreatorSteps;
  isLastStep?: boolean;
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
}: IStepButtons) {
  const { t } = useTranslation(['daoCreate', 'common']);

  const forwardButtonText =
    isLastStep && isSubDAO
      ? t('labelDeploySubDAO')
      : t(isLastStep ? 'deploy' : 'next', { ns: 'common' });
  const buttonType = isLastStep ? 'submit' : 'button';
  return (
    <Flex alignItems="center">
      {prevStep && (
        <Button
          data-testid="create-prevButton"
          variant="text"
          disabled={transactionPending || isSubmitting}
          onClick={() => updateStep(prevStep)}
        >
          {t('prev', { ns: 'common' })}
        </Button>
      )}
      <Button
        w="full"
        type={buttonType}
        disabled={transactionPending || isSubmitting || !!errors[step]}
        onClick={() => (!isLastStep && nextStep ? updateStep(nextStep) : {})}
        data-testid={!isLastStep ? 'create-skipNextButton' : 'create-deployDAO'}
      >
        {forwardButtonText}
      </Button>
    </Flex>
  );
}
