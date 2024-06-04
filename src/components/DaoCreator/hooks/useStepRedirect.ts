import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_ROUTES, DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { CreatorFormState } from '../../../types';
import { DAOCreateMode } from '../formComponents/EstablishEssentials';

export default function useStepRedirect({
  values,
  mode,
  redirectOnMount = true,
}: {
  values: CreatorFormState;
  mode: DAOCreateMode;
  redirectOnMount?: boolean;
}) {
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();
  const {
    node: { daoAddress },
  } = useFractal();

  const redirectToInitialStep = useCallback(() => {
    if (mode === DAOCreateMode.ROOTDAO) {
      navigate(BASE_ROUTES.create, { replace: true });
    } else if (mode === DAOCreateMode.SUBDAO && daoAddress) {
      navigate(DAO_ROUTES.newSubDao.relative(addressPrefix, daoAddress), { replace: true });
    } else if (mode === DAOCreateMode.EDIT && daoAddress) {
      navigate(DAO_ROUTES.modifyGovernance.relative(addressPrefix, daoAddress), { replace: true });
    }
  }, [navigate, mode, addressPrefix, daoAddress]);
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
