import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/types';
import { useCreateSubDAOProposal } from '../../hooks/DAO/useCreateSubDAOProposal';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { GovernanceTypes } from '../../providers/Fractal/types';
import { DAO_ROUTES } from '../../routes/constants';

function SubDaoCreate() {
  const navigate = useNavigate();
  const {
    actions: { refreshSafeData },
  } = useFractal();

  const nonce = useDefaultNonce();

  const successCallback = async (daoAddress: string) => {
    await refreshSafeData();
    navigate(DAO_ROUTES.dao.relative(daoAddress));
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: GnosisDAO | TokenGovernanceDAO) => {
    if (daoData.governance === GovernanceTypes.GNOSIS_SAFE) {
      const gnosisDaoData = daoData as GnosisDAO;
      proposeDao(daoData, gnosisDaoData.customNonce || nonce, successCallback);
    } else {
      proposeDao(daoData, nonce, successCallback);
    }
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
