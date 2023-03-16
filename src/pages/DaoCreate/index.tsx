import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import useDeployDAO from '../../hooks/DAO/useDeployDAO';
import { useAsyncRetry } from '../../hooks/utils/useAsyncRetry';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';
import { GnosisDAO, TokenGovernanceDAO } from '../../types';

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
        () => safeService.getSafeCreationInfo(ethers.utils.getAddress(daoAddress)),
        5
      );
      if (daoFound) {
        toggleFavorite(ethers.utils.getAddress(daoAddress));
        navigate(DAO_ROUTES.dao.relative(ethers.utils.getAddress(daoAddress)));
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
