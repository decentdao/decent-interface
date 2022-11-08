import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import useDeployDAO from '../../hooks/useDeployDAO';

function DaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: GnosisDAO) => {
    deploy(daoData, successCallback, false);
  };

  return (
    <DaoCreator
      pending={pending}
      deployDAO={deployDAO}
    />
  );
}

export default DaoCreate;
