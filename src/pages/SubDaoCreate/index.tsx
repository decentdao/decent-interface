import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import useCreateSubDAOProposal from '../../hooks/useCreateSubDAOProposal';

function SubDaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: GnosisDAO) => {
    proposeDao(daoData, successCallback);
  };

  return (
    <DaoCreator
      pending={pendingCreateTx}
      deployDAO={proposeSubDAO}
      isSubDAO={true}
    />
  );
}

export default SubDaoCreate;
