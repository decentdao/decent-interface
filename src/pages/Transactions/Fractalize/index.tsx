import DaoCreator from '../../../components/DaoCreator';
import useCreateDAODataCreator from '../../../hooks/useCreateDAODataCreator';
import useCreateProposal from '../../../hooks/useCreateProposal';
import { ExecuteData } from '../../../types/execute';
import { useNavigate } from 'react-router-dom';
import { useDAOData } from '../../../contexts/daoData';
import { useBlockchainData } from '../../../contexts/blockchainData';
import { DAODeployData } from '../../../components/DaoCreator/provider/types';

function Fractalize() {
  const [{ daoAddress }] = useDAOData();
  const navigate = useNavigate();

  const [createProposal, pending] = useCreateProposal();

  const createDAODataCreator = useCreateDAODataCreator();

  const { metaFactoryContract } = useBlockchainData();

  const successCallback = () => {
    if (!daoAddress) {
      return;
    }

    navigate(`/daos/${daoAddress}`);
  };

  const createDAOTrigger = (daoData: DAODeployData) => {
    if (daoAddress === undefined) {
      return;
    }

    const newDAOData = createDAODataCreator({
      creator: daoAddress,
      ...daoData,
    });

    if (!metaFactoryContract || !newDAOData) {
      return;
    }

    const data: ExecuteData = {
      targets: [metaFactoryContract.address],
      values: [0],
      calldatas: [
        metaFactoryContract.interface.encodeFunctionData('createDAOAndExecute', [
          newDAOData.daoFactory,
          newDAOData.createDAOParams,
          newDAOData.moduleFactories,
          newDAOData.moduleFactoriesBytes,
          newDAOData.targets,
          newDAOData.values,
          newDAOData.calldatas,
        ]),
      ],
    };

    createProposal({
      proposalData: { ...data, description: `New subDAO: ${daoData.daoName}` },
      successCallback,
    });
  };

  return (
    <DaoCreator
      pending={pending}
      nextTrigger={createDAOTrigger}
      isSubDAO
    />
  );
}

export default Fractalize;
