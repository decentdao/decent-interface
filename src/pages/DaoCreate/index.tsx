import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { TokenGovernanceDAO } from '../../components/DaoCreator/provider/types';
import useDeployDAO from '../../hooks/useDeployDAO';

function DaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const deployNewDAO = (daoData: TokenGovernanceDAO) => {
    deploy({
      ...daoData,
      successCallback,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      nextTrigger={deployNewDAO}
    />
  );
}

export default DaoCreate;
