import { useTranslation } from 'react-i18next';
import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { TextButton, SecondaryButton, PrimaryButton } from '../ui/forms/Button';
import LeftArrow from '../ui/svg/LeftArrow';
import RightArrow from '../ui/svg/RightArrow';
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
      <TextButton
        onClick={() =>
          dispatch({
            type: CreatorProviderActions.SET_STEP,
            payload: state.prevStep!,
          })
        }
        disabled={pending}
        icon={<LeftArrow />}
        label={t('prev')}
      />
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
        <SecondaryButton
          onClick={() =>
            dispatch({
              type: CreatorProviderActions.SET_STEP,
              payload: state.nextStep!,
            })
          }
          disabled={isNextDisabled}
          isIconRight
          icon={<RightArrow />}
          label={canSkip ? t('skip') : t('next')}
        />
      );
    case CreatorSteps.GOV_CONFIG:
      return (
        <PrimaryButton
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
          label={deployLabel}
          isLarge
          className="w-48"
          disabled={pending || !account || isNextDisabled}
        />
      );
    case CreatorSteps.GNOSIS_GOVERNANCE:
    case CreatorSteps.PURE_GNOSIS: {
      return (
        <PrimaryButton
          onClick={() =>
            deployDAO({ ...state.essentials, ...state.gnosis, governance: state.governance })
          }
          label={deployLabel}
          isLarge
          className="w-48"
          disabled={pending || !account || isNextDisabled}
        />
      );
    }
    default:
      return null;
  }
}

export function StepButtons({ pending, isSubDAO, deployDAO }: IStepButtons) {
  return (
    <div className="flex items-center justify-center py-4">
      <PrevButton pending={pending} />
      <ForwardButton
        pending={pending}
        isSubDAO={isSubDAO}
        deployDAO={deployDAO}
      />
    </div>
  );
}
