'use client';

import { useRouter } from 'next/navigation';
import DaoCreator from '../../../../src/components/DaoCreator';
import { DAO_ROUTES } from '../../../../src/constants/routes';
import { useCreateSubDAOProposal } from '../../../../src/hooks/DAO/useCreateSubDAOProposal';
import useDefaultNonce from '../../../../src/hooks/DAO/useDefaultNonce';
import { useFractal } from '../../../../src/providers/Fractal/hooks/useFractal';
import { GnosisDAO, TokenGovernanceDAO, SubDAO } from '../../../../src/types';

function SubDaoCreate() {
  const { push } = useRouter();
  const {
    actions: { refreshSafeData },
  } = useFractal();

  const nonce = useDefaultNonce();

  const successCallback = async (daoAddress: string) => {
    await refreshSafeData();
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
