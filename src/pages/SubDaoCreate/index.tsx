import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
// import useDeployDAO from '../../hooks/useDeployDAO';
import useDeployDAO from '../../hooks/useDeployDAO';

function SubDaoCreate() {
  const navigate = useNavigate();

  const successCallback = () => {
    // navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const proposeSubDAO = (daoData: GnosisDAO) => {
    deploy(daoData, successCallback, true);
  };

  return (
    <DaoCreator
      pending={pending}
      deployDAO={proposeSubDAO}
      isSubDAO={true}
    />
  );
}

export default SubDaoCreate;
