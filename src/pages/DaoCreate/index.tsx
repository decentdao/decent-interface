import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import {
  GnosisDAO,
  GovernanceTypes,
  TokenGovernanceDAO,
} from '../../components/DaoCreator/provider/types';
import useDeployDAO from '../../hooks/useDeployDAO';

function DaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: TokenGovernanceDAO | GnosisDAO, type: GovernanceTypes) => {
    deploy(daoData, type, successCallback);
  };

  return (
    <DaoCreator
      pending={pending}
      deployDAO={deployDAO}
    />
  );
}

export default DaoCreate;
