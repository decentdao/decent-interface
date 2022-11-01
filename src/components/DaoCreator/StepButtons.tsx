import { Flex } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight, Button } from '@decent-org/fractal-ui';
import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { useCreator } from './provider/hooks/useCreator';
import { useNextDisabled } from './provider/hooks/useNextDisabled';
import {
  CreatorProviderActions,
  CreatorSteps,
  DAOTrigger,
  GovernanceTypes,
} from './provider/types';

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
  switch (state.step) {
    case CreatorSteps.CHOOSE_GOVERNANCE:
    case CreatorSteps.ESSENTIALS:
    case CreatorSteps.FUNDING:
    case CreatorSteps.TREASURY_GOV_TOKEN:
    case CreatorSteps.GNOSIS_WITH_USUL:
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
    case CreatorSteps.GOV_CONFIG:
      return (
        <Button
          data-testid="create-deployDAO"
          onClick={() =>
            deployDAO({
              governance: state.governance,
              ...state.essentials,
              ...state.funding,
              ...state.govModule,
              ...state.govToken,
              ...(state.governance === GovernanceTypes.GNOSIS_SAFE ||
              state.governance === GovernanceTypes.GNOSIS_SAFE_USUL
                ? state.gnosis
                : {}),
            })
          }
          size="lg"
          isDisabled={pending || !account || isNextDisabled}
        >
          {deployLabel}
        </Button>
      );
    case CreatorSteps.GNOSIS_GOVERNANCE:
    case CreatorSteps.PURE_GNOSIS: {
      return (
        <Button
          data-testid="create-deployDAO"
          onClick={() =>
            deployDAO({ ...state.essentials, ...state.gnosis, governance: state.governance })
          }
          size="lg"
          isDisabled={pending || !account || isNextDisabled}
        >
          {deployLabel}
        </Button>
      );
    }
    default:
      return null;
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
