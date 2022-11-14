import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import useProposeDAO from '../../hooks/useProposeDAO';

function SubDaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [propose, pending] = useProposeDAO();

  const proposeSubDAO = (daoData: GnosisDAO) => {
    propose(daoData, successCallback);
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
