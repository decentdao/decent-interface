import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/types';
import useDeployDAO from '../../hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../hooks/utils/useAsyncRetry';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';

function DaoCreate() {
  const navigate = useNavigate();
  const { requestWithRetries } = useAsyncRetry();
  const {
    gnosis: { safeService },
    account: {
      favorites: { toggleFavorite },
    },
  } = useFractal();

  const successCallback = useCallback(
    async (daoAddress: string) => {
      if (!safeService) return;

      const daoFound = await requestWithRetries(
        () => safeService.getSafeCreationInfo(daoAddress),
        5
      );
      if (daoFound) {
        toggleFavorite(daoAddress);
        navigate(DAO_ROUTES.dao.relative(daoAddress));
      }
    },
    [safeService, requestWithRetries, toggleFavorite, navigate]
  );

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: GnosisDAO | TokenGovernanceDAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <DaoCreator
      pending={pending}
      deployDAO={deployDAO}
    />
  );
}

export default DaoCreate;
