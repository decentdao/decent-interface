import { Flex, Button, Icon } from '@chakra-ui/react';
import { CaretRight, CaretLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
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
  isSubDAO,
  nextStep,
  prevStep,
  isLastStep,
  isNextDisabled,
  isEdit,
}: IStepButtons) {
  const { step } = useParams();
  const creatorStep = step as CreatorSteps | undefined;
  const navigate = useNavigate();
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
      justifyContent="flex-end"
      width="100%"
      mt="1.5rem"
      gap="0.75rem"
    >
      {prevStep && (
        <Button
          data-testid="create-prevButton"
          variant="text"
          isDisabled={transactionPending || isSubmitting}
          onClick={() => navigate(`/create/${prevStep}`)}
          color="lilac-0"
          px="2rem"
        >
          <Icon as={CaretLeft} />
          {t('back', { ns: 'common' })}
        </Button>
      )}
      <Button
        type={buttonType}
        isDisabled={
          transactionPending ||
          isSubmitting ||
          !creatorStep ||
          !!errors[creatorStep] ||
          isNextDisabled
        }
        px="2rem"
        onClick={() => {
          if (!isLastStep && nextStep) {
            navigate(`/create/${nextStep}`);
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
