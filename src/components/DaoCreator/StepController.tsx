import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const { values, setFieldValue } = props;

  const { redirectToInitialStep } = useStepRedirect({ values, redirectOnMount: false });

  useEffect(() => {
    // @dev - The only possible way for this to become true if someone will choose governance option and then would switch network
    if (!createOptions.includes(values.essentials.governance)) {
      setFieldValue('essentials.governance', GovernanceType.MULTISIG);
      redirectToInitialStep();
      toast(t('errorUnsupportedCreateOption'));
    }
  }, [createOptions, setFieldValue, values.essentials.governance, t, redirectToInitialStep]);

  return (
    <Routes>
      <Route
        path={CreatorSteps.ESSENTIALS}
        element={<EstablishEssentials {...props} />}
      />
      <Route
        path={CreatorSteps.MULTISIG_DETAILS}
        element={<Multisig {...props} />}
      />
      <Route
        path={CreatorSteps.AZORIUS_DETAILS}
        element={<AzoriusGovernance {...props} />}
      />
      <Route
        path={CreatorSteps.ERC20_DETAILS}
        element={<AzoriusTokenDetails {...props} />}
      />
      <Route
        path={CreatorSteps.ERC721_DETAILS}
        element={<AzoriusNFTDetails {...props} />}
      />
      <Route
        path={CreatorSteps.FREEZE_DETAILS}
        element={<GuardDetails {...props} />}
      />
      <Route
        path="*"
        element={
          <Navigate
            to={`${CreatorSteps.ESSENTIALS}${location.search}`}
            replace
          />
        }
      />
    </Routes>
  );
}

export default StepController;
