import { useState } from 'react';
import { ICreationStepProps, CreatorSteps } from '../../types';
import { AzoriusGovernance } from './formComponents/AzoriusGovernance';
import { AzoriusTokenDetails } from './formComponents/AzoriusTokenDetails';
import { EstablishEssentials } from './formComponents/EstablishEssentials';
import { GnosisMultisig } from './formComponents/GnosisMultisig';
import GuardDetails from './formComponents/GuardDetails';

function StepController(props: Omit<ICreationStepProps, 'step' | 'updateStep'>) {
  const [step, setStepState] = useState<CreatorSteps>(CreatorSteps.ESSENTIALS);
  const updateStep = (newStep: CreatorSteps) => {
    setStepState(newStep);
  };
  switch (step) {
    case CreatorSteps.ESSENTIALS:
      return (
        <EstablishEssentials
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.MULTISIG_GOVERNANCE:
      return (
        <GnosisMultisig
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.AZORIUS_GOVERNANCE:
      return (
        <AzoriusTokenDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.GOV_CONFIG:
      return (
        <AzoriusGovernance
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.GUARD_CONFIG:
      return (
        <GuardDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    default:
      return <></>;
  }
}

export default StepController;
