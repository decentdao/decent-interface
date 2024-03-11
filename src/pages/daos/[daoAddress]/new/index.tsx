import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../../../components/DaoCreator';
import { DAOCreateMode } from '../../../../components/DaoCreator/formComponents/EstablishEssentials';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCreateSubDAOProposal } from '../../../../hooks/DAO/useCreateSubDAOProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { SafeMultisigDAO, AzoriusGovernanceDAO, SubDAO } from '../../../../types';

export default function SubDaoCreate() {
  const navigate = useNavigate();
  const [redirectPending, setRedirectPending] = useState(false);
  const {
    node: { safe },
  } = useFractal();

  const successCallback = async (daoAddress: string) => {
    setRedirectPending(true);
    navigate(DAO_ROUTES.dao.relative(daoAddress));
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: SafeMultisigDAO | AzoriusGovernanceDAO | SubDAO) => {
    const subDAOData = daoData as SubDAO;
    proposeDao(subDAOData, subDAOData.customNonce || safe?.nonce, successCallback);
  };

  return (
      <DaoCreator
        pending={pendingCreateTx || redirectPending}
        deployDAO={proposeSubDAO}
        isSubDAO={true}
        mode={DAOCreateMode.SUBDAO}
      />
  );
}
