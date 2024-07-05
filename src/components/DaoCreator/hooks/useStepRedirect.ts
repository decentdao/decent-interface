import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreatorFormState, CreatorSteps } from '../../../types';

export default function useStepRedirect({
  values,
  redirectOnMount = true,
}: {
  values: CreatorFormState;
  redirectOnMount?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectToInitialStep = useCallback(() => {
    const paths = location.pathname.split('/');
    const step = paths[paths.length - 1] || paths[paths.length - 2];
    // @dev In fact, step can't be `undefined` here cause it will be redirected by logic in routes definition
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
