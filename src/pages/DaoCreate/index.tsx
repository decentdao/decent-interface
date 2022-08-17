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

  const deployNewDAO = (daoData: TokenGovernanceDAO | GnosisDAO, type: GovernanceTypes) => {
    if (type === GovernanceTypes.TOKEN_VOTING_GOVERNANCE) {
      deploy({
        ...(daoData as TokenGovernanceDAO),
        successCallback,
      });
    }
    // @todo Gnosis Deploy
  };

  return (
    <DaoCreator
      pending={pending}
      nextTrigger={deployNewDAO}
    />
  );
}

export default DaoCreate;
