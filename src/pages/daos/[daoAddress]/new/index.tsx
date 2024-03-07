'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DaoCreator from '../../../../components/DaoCreator';
import { DAOCreateMode } from '../../../../components/DaoCreator/formComponents/EstablishEssentials';
import ClientOnly from '../../../../components/ui/utils/ClientOnly';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCreateSubDAOProposal } from '../../../../hooks/DAO/useCreateSubDAOProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { SafeMultisigDAO, AzoriusGovernanceDAO, SubDAO } from '../../../../types';

export default function SubDaoCreate() {
  const { push } = useRouter();
  const [redirectPending, setRedirectPending] = useState(false);
  const {
    node: { safe },
  } = useFractal();

  const successCallback = async (daoAddress: string) => {
    setRedirectPending(true);
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
