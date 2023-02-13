import { Divider, Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CreatorSteps, ICreationStepProps } from './types';
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
  updateStep,
  nextStep,
  prevStep,
  isLastStep,
}: IStepButtons) {
  const { t } = useTranslation(['daoCreate', 'common']);

  const forwardButtonTest = t(isLastStep ? 'deploy' : 'next', { ns: 'common' });
  const buttonType = isLastStep ? 'submit' : 'button';
  return (
    <>
      <Divider color="chocolate.700" />
      <Flex alignItems="center">
        {prevStep && (
          <Button
            data-testid="create-prevButton"
            variant="text"
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
          {forwardButtonTest}
        </Button>
      </Flex>
    </>
  );
}
