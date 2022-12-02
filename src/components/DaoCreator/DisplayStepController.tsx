import { ChooseGovernance } from './ChooseGovernance';
import DAODetails from './DAODetails';
import GuardDetails from './GuardDetails';
import { SubsidiaryFunding } from './SubsidiaryFunding';
import { GnosisConfig } from './gnosis/GnosisConfig';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorSteps } from './provider/types';
import GovernanceDetails from './tokenVotingGovernance/GovernanceDetails';
import TokenDetails from './tokenVotingGovernance/TokenDetails';

function StepController() {
  const { state } = useCreator();
  switch (state.step) {
    case CreatorSteps.ESSENTIALS:
      return <DAODetails />;
    case CreatorSteps.CHOOSE_GOVERNANCE:
      return <ChooseGovernance />;
    case CreatorSteps.PURE_GNOSIS:
    case CreatorSteps.GNOSIS_GOVERNANCE:
      return <GnosisConfig />;
    case CreatorSteps.FUNDING: {
      return <SubsidiaryFunding />;
    }
    case CreatorSteps.GNOSIS_WITH_USUL:
      return <TokenDetails />;
    case CreatorSteps.GOV_CONFIG:
      return <GovernanceDetails />;
    case CreatorSteps.GUARD_CONFIG:
      return <GuardDetails />;
    default:
      return <></>;
  }
}

export default StepController;
