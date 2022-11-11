import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO } from '../../components/DaoCreator/provider/types';
import useProposeDAO from '../../hooks/useProposeDAO';
import { useFractal } from '../../providers/fractal/hooks/useFractal';

function SubDaoCreate() {
  const {
    gnosis: { safe },
  } = useFractal();
  const navigate = useNavigate();

  const successCallback = () => {
    navigate(`/daos/${safe.address}`);
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
