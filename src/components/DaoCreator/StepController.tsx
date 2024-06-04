import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useNetworkConfig } from '../../providers/NetworkConfig/NetworkConfigProvider';
import { ICreationStepProps, CreatorSteps, GovernanceType } from '../../types';
import { AzoriusGovernance } from './formComponents/AzoriusGovernance';
import AzoriusNFTDetails from './formComponents/AzoriusNFTDetails';
import { AzoriusTokenDetails } from './formComponents/AzoriusTokenDetails';
import { EstablishEssentials } from './formComponents/EstablishEssentials';
import GuardDetails from './formComponents/GuardDetails';
import { Multisig } from './formComponents/Multisig';
import useStepRedirect from './hooks/useStepRedirect';

function StepController(props: ICreationStepProps) {
  const { t } = useTranslation('daoCreate');
  const { createOptions } = useNetworkConfig();
  const navigate = useNavigate();
  const { step } = useParams();

  const { values, setFieldValue, mode } = props;

  const { redirectToInitialStep } = useStepRedirect({ values, mode, redirectOnMount: false });

  useEffect(() => {
    const steps = Object.values(CreatorSteps);
    if (!step || !steps.includes(step as CreatorSteps)) {
      redirectToInitialStep();
    }
  }, [step, redirectToInitialStep]);

  useEffect(() => {
    // @dev - The only possible way for this to become true if someone will choose governance option and then would switch network
    if (!createOptions.includes(values.essentials.governance)) {
      setFieldValue('essentials.governance', GovernanceType.MULTISIG);
      redirectToInitialStep();
      toast(t('errorUnsupportedCreateOption'));
    }
  }, [
    createOptions,
    setFieldValue,
    values.essentials.governance,
    navigate,
    t,
    redirectToInitialStep,
  ]);

  let CurrentStepComponent;
  switch (step) {
    case CreatorSteps.ESSENTIALS:
      CurrentStepComponent = EstablishEssentials;
      break;
    case CreatorSteps.MULTISIG_DETAILS:
      CurrentStepComponent = Multisig;
      break;
    case CreatorSteps.AZORIUS_DETAILS:
      CurrentStepComponent = AzoriusGovernance;
      break;
    case CreatorSteps.ERC20_DETAILS:
      CurrentStepComponent = AzoriusTokenDetails;
      break;
    case CreatorSteps.ERC721_DETAILS:
      CurrentStepComponent = AzoriusNFTDetails;
      break;
    case CreatorSteps.FREEZE_DETAILS:
      CurrentStepComponent = GuardDetails;
      break;
    default:
      return null;
  }

  return <CurrentStepComponent {...props} />;
}

export default StepController;
