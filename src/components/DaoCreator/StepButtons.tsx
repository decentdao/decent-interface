import { Flex, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useFractal } from '../../providers/App/AppProvider';
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
  const {
    readOnly: { user },
  } = useFractal();

  const forwardButtonText =
    isLastStep && isSubDAO
      ? t('labelDeploySubDAO')
      : isLastStep && isEdit
      ? t('labelDeployAzorius')
      : t(isLastStep ? 'deploy' : 'next', { ns: 'common' });
  const buttonType = isLastStep ? 'submit' : 'button';
  return (
    <Flex
      alignItems="center"
      width="100%"
    >
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
        onClick={() => {
          if (!isLastStep && nextStep) {
            updateStep(nextStep);
          } else if (isLastStep && !user.address) {
            toast(t('toastDisconnected'), {
              closeOnClick: true,
            });
          }
        }}
        data-testid={!isLastStep ? 'create-skipNextButton' : 'create-deployDAO'}
      >
        {forwardButtonText}
      </Button>
    </Flex>
  );
}
