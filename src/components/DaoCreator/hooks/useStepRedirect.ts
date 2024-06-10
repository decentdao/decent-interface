import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreatorFormState, CreatorSteps } from '../../../types';
import { DAOCreateMode } from '../formComponents/EstablishEssentials';

export default function useStepRedirect({
  values,
  redirectOnMount = true,
}: {
  values: CreatorFormState;
  mode: DAOCreateMode;
  redirectOnMount?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToInitialStep = useCallback(() => {
    const step = location.pathname.split('/').pop();
    const redirectPath = `${location.pathname.replace(`${step}`, CreatorSteps.ESSENTIALS)}${location.search}`;
    navigate(redirectPath, { replace: true });
  }, [navigate, location]);

  useEffect(() => {
    // @dev we might be also checking for other required values at given step
    // However, only imaginable way how consequent step might be missing required data is from page reload
    // Thus, we can actually rely on just missing daoName and governance
    if (redirectOnMount && (!values.essentials.daoName || !values.essentials.governance)) {
      redirectToInitialStep();
    }
  }, [
    redirectToInitialStep,
    values.essentials.daoName,
    values.essentials.governance,
    redirectOnMount,
  ]);

  return { redirectToInitialStep };
}
