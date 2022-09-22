import DAODetails from './DAODetails';
import { useCreator } from './provider/hooks/useCreator';
import { CreatorSteps } from './provider/types';
import { SubsidiaryFunding } from './SubsidiaryFunding';
import TokenDetails from './tokenVotingGovernance/TokenDetails';
import GovernanceDetails from './tokenVotingGovernance/GovernanceDetails';
import { ChooseGovernance } from './ChooseGovernance';
import { GnosisConfig } from './gnosis/GnosisConfig';

function StepController() {
  const { state } = useCreator();
  switch (state.step) {
    case CreatorSteps.ESSENTIALS:
      return <DAODetails />;
    case CreatorSteps.CHOOSE_GOVERNANCE:
      return <ChooseGovernance />;
    case CreatorSteps.GNOSIS_GOVERNANCE:
      return <GnosisConfig />;
    case CreatorSteps.FUNDING: {
      return <SubsidiaryFunding />;
    }
    case CreatorSteps.TREASURY_GOV_TOKEN:
      return <TokenDetails />;
    case CreatorSteps.GOV_CONFIG:
      return <GovernanceDetails />;
    default:
      return <></>;
  }
}

export default StepController;
