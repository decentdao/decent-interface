import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import useCreateSubDAOProposal from '../../hooks/useCreateSubDAOProposal';

function SubDaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [propose, pending] = useCreateSubDAOProposal();

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
