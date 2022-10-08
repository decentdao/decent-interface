import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../components/DaoCreator';
import { GnosisDAO, TokenGovernanceDAO } from '../../components/DaoCreator/provider/types';
import TokenGate from '../../components/TokenGate';
import useDeployDAO from '../../hooks/useDeployDAO';

function DaoCreate() {
  const navigate = useNavigate();

  const successCallback = (daoAddress: string) => {
    navigate(`/daos/${daoAddress}`);
  };

  const [deploy, pending] = useDeployDAO();

  const deployDAO = (daoData: TokenGovernanceDAO | GnosisDAO) => {
    deploy(daoData, successCallback);
  };

  return (
    <>
      {/* TODO just gating this for testing, we don't necessarily want to gate DAO creation */}
      <TokenGate
        featureName="DAO creation"
        alwaysRequireConnected={false}
      />
      <DaoCreator
        pending={pending}
        deployDAO={deployDAO}
      />
    </>
  );
}

export default DaoCreate;
