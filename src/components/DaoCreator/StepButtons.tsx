import { Flex, Button } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../providers/Web3Data/hooks/useWeb3Provider';
import { useCreator } from './provider/hooks/useCreator';
import { useNextDisabled } from './provider/hooks/useNextDisabled';
import { CreatorProviderActions, CreatorSteps, DAOTrigger } from './provider/types';

interface IStepButtons {
  pending?: boolean;
  deployDAO: DAOTrigger;
  isSubDAO?: boolean;
}

function PrevButton({ pending }: { pending?: boolean }) {
  const { state, dispatch } = useCreator();
  const { t } = useTranslation();
  if (state.prevStep !== null) {
    return (
      <Button
        data-testid="create-prevButton"
        variant="text"
        size="lg"
        onClick={() =>
          dispatch({
            type: CreatorProviderActions.SET_STEP,
            payload: state.prevStep!,
          })
        }
        disabled={pending}
        leftIcon={<ArrowLeft />}
      >
        {t('prev')}
      </Button>
    );
  }
  return null;
}

function ForwardButton({
  isSubDAO,
  deployDAO,
  pending,
}: {
  isSubDAO?: boolean;
  deployDAO: DAOTrigger;
  pending?: boolean;
}) {
  const { state, dispatch } = useCreator();
  const {
    state: { account },
  } = useWeb3Provider();
  const { t } = useTranslation(['common', 'daoCreate']);
  const isNextDisabled = useNextDisabled(state);
  const deployLabel = isSubDAO ? t('labelDeploySubDAO', { ns: 'daoCreate' }) : t('deploy');

  if (
    state.step === CreatorSteps.ESSENTIALS ||
    state.step === CreatorSteps.CHOOSE_GOVERNANCE ||
    state.step === CreatorSteps.FUNDING ||
    state.step === CreatorSteps.GNOSIS_WITH_USUL ||
    (state.step === CreatorSteps.GOV_CONFIG && isSubDAO) ||
    (state.step === CreatorSteps.PURE_GNOSIS && isSubDAO)
  ) {
    const canSkip =
      state.step === CreatorSteps.FUNDING &&
      state.funding.nftsToFund?.length + state.funding.tokensToFund?.length === 0;
    return (
      <Button
        data-testid="create-nextButton"
        size="lg"
        onClick={() =>
          dispatch({
            type: CreatorProviderActions.SET_STEP,
            payload: state.nextStep!,
          })
        }
        isDisabled={isNextDisabled}
        rightIcon={<ArrowRight />}
      >
        {canSkip ? t('skip') : t('next')}
      </Button>
    );
  } else {
    return (
      <Button
        data-testid="create-deployDAO"
        onClick={() =>
          deployDAO({
            ...state.essentials,
            ...state.govToken,
            ...state.gnosis,
            ...state.govModule,
            ...state.vetoGuard,
            governance: state.governance,
          })
        }
        size="lg"
        isDisabled={pending || !account || isNextDisabled}
      >
        {deployLabel}
      </Button>
    );
  }
}

export function StepButtons({ pending, isSubDAO, deployDAO }: IStepButtons) {
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      py="4"
    >
      <PrevButton pending={pending} />
      <ForwardButton
        pending={pending}
        isSubDAO={isSubDAO}
        deployDAO={deployDAO}
      />
    </Flex>
  );
}
