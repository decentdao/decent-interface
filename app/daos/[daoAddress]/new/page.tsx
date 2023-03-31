'use client';

import { useRouter } from 'next/navigation';
import DaoCreator from '../../../../src/components/DaoCreator';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useDAOProposals } from '../../../../src/hooks/DAO/loaders/useProposals';
import { useCreateSubDAOProposal } from '../../../../src/hooks/DAO/useCreateSubDAOProposal';
import useDefaultNonce from '../../../../src/hooks/DAO/useDefaultNonce';
import { GnosisDAO, TokenGovernanceDAO, SubDAO } from '../../../../src/types';

function SubDaoCreate() {
  const { push } = useRouter();
  const loadDAOProposals = useDAOProposals();

  const nonce = useDefaultNonce();

  const successCallback = async (daoAddress: string) => {
    await loadDAOProposals();
    push(DAO_ROUTES.dao.relative(daoAddress));
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: GnosisDAO | TokenGovernanceDAO | SubDAO) => {
    const subDAOData = daoData as SubDAO;
    proposeDao(subDAOData, subDAOData.customNonce || nonce, successCallback);
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
