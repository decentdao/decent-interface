import { useState } from 'react';
import { ICreationStepProps, CreatorSteps } from '../../types';
import { AzoriusGovernance } from './formComponents/AzoriusGovernance';
import AzoriusNFTDetails from './formComponents/AzoriusNFTDetails';
import { AzoriusTokenDetails } from './formComponents/AzoriusTokenDetails';
import { EstablishEssentials } from './formComponents/EstablishEssentials';
import GuardDetails from './formComponents/GuardDetails';
import { Multisig } from './formComponents/Multisig';

function StepController(props: Omit<ICreationStepProps, 'step' | 'updateStep'>) {
  const [step, setStepState] = useState<CreatorSteps>(CreatorSteps.ESSENTIALS);
  const updateStep = (newStep: CreatorSteps) => {
    setStepState(newStep);
    window.scrollTo(0, 0);
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
    case CreatorSteps.MULTISIG_DETAILS:
      return (
        <Multisig
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.AZORIUS_DETAILS:
      return (
        <AzoriusGovernance
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.ERC20_DETAILS:
      return (
        <AzoriusTokenDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.ERC721_DETAILS:
      return (
        <AzoriusNFTDetails
          {...props}
          step={step}
          updateStep={updateStep}
        />
      );
    case CreatorSteps.FREEZE_DETAILS:
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
