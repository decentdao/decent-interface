import { useWeb3Provider } from '../../contexts/web3Data/hooks/useWeb3Provider';
import { TextButton, SecondaryButton, PrimaryButton } from '../ui/forms/Button';
import LeftArrow from '../ui/svg/LeftArrow';
import RightArrow from '../ui/svg/RightArrow';
import { useCreator } from './provider/hooks/useCreator';
import { useDeployDisabled } from './provider/hooks/useDeployDisabled';
import { useNextDisabled } from './provider/hooks/useNextDisabled';
import { CreatorProviderActions, CreatorSteps, DAOTrigger } from './provider/types';

interface IStepButtons {
  pending?: boolean;
  daoTrigger: DAOTrigger;
  isSubDAO?: boolean;
}

function PrevButton({ pending }: { pending?: boolean }) {
  const { state, dispatch } = useCreator();
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
        label="Prev"
      />
    );
  }
  return null;
}

function ForwardButton({
  isSubDAO,
  daoTrigger,
  pending,
}: {
  isSubDAO?: boolean;
  daoTrigger: DAOTrigger;
  pending?: boolean;
}) {
  const { state, dispatch } = useCreator();
  const {
    state: { account },
  } = useWeb3Provider();
  const isNextDisabled = useNextDisabled(state);
  const deployLabel = isSubDAO ? 'Create subDAO Proposal' : 'Deploy';
  const isDeployDisabled = useDeployDisabled(state);
  switch (state.step) {
    case CreatorSteps.CHOOSE_GOVERNANCE:
    case CreatorSteps.ESSENTIALS:
    case CreatorSteps.FUNDING:
    case CreatorSteps.TREASURY_GOV_TOKEN:
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
          label="Next"
        />
      );
    case CreatorSteps.GOV_CONFIG:
      return (
        <PrimaryButton
          onClick={() =>
            daoTrigger({
              ...state.essentials,
              ...state.funding,
              ...state.govModule,
              ...state.govToken,
            })
          }
          label={deployLabel}
          isLarge
          className="w-48"
          disabled={pending || !account || isDeployDisabled}
        />
      );
    case CreatorSteps.GNOSIS_GOVERNANCE: {
      return (
        <PrimaryButton
          onClick={() =>
            daoTrigger({
              ...state.essentials,
              ...state.funding,
              ...state.govModule,
              ...state.govToken,
            })
          }
          label={deployLabel}
          isLarge
          className="w-48"
          disabled={pending || !account || isDeployDisabled}
        />
      );
    }
    default:
      return null;
  }
}

export function StepButtons({ pending, isSubDAO, daoTrigger }: IStepButtons) {
  return (
    <div className="flex items-center justify-center py-4">
      <PrevButton pending={pending} />
      <ForwardButton
        pending={pending}
        isSubDAO={isSubDAO}
        daoTrigger={daoTrigger}
      />
    </div>
  );
}
