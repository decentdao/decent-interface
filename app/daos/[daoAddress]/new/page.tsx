'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DaoCreator from '../../../../src/components/DaoCreator';
import { DAOCreateMode } from '../../../../src/components/DaoCreator/formComponents/EstablishEssentials';
import ClientOnly from '../../../../src/components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useDAOProposals } from '../../../../src/hooks/DAO/loaders/useProposals';
import { useCreateSubDAOProposal } from '../../../../src/hooks/DAO/useCreateSubDAOProposal';
import { useFractal } from '../../../../src/providers/App/AppProvider';
import { SafeMultisigDAO, AzoriusGovernanceDAO, SubDAO } from '../../../../src/types';

export default function SubDaoCreate() {
  const { push } = useRouter();
  const [redirectPending, setRedirectPending] = useState(false);
  const loadDAOProposals = useDAOProposals();
  const {
    node: { safe },
  } = useFractal();

  const successCallback = async (daoAddress: string) => {
    setRedirectPending(true);
    await loadDAOProposals();
    push(DAO_ROUTES.dao.relative(daoAddress));
  };

  const { proposeDao, pendingCreateTx } = useCreateSubDAOProposal();

  const proposeSubDAO = (daoData: SafeMultisigDAO | AzoriusGovernanceDAO | SubDAO) => {
    const subDAOData = daoData as SubDAO;
    proposeDao(subDAOData, subDAOData.customNonce || safe?.nonce, successCallback);
  };

  return (
    <ClientOnly>
      <DaoCreator
        pending={pendingCreateTx || redirectPending}
        deployDAO={proposeSubDAO}
        isSubDAO={true}
        mode={DAOCreateMode.SUBDAO}
      />
    </ClientOnly>
  );
}
