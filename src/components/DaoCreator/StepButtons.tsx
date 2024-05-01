import { Flex, Button, Icon } from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
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
      mt="1.5rem"
    >
      {prevStep && (
        <Button
          data-testid="create-prevButton"
          variant="text"
          isDisabled={transactionPending || isSubmitting}
          onClick={() => updateStep(prevStep)}
          color="lilac-0"
          width="50%"
        >
          <Icon as={CaretLeft} />
          {t('back', { ns: 'common' })}
        </Button>
      )}
      <Button
        w={prevStep ? '50%' : 'full'}
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
        {!isLastStep && <Icon as={CaretRight} />}
      </Button>
    </Flex>
  );
}
