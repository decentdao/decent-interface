import { useRouter } from 'next/router';
import DaoCreator from '../../components/DaoCreator';
import { useCreateSubDAOProposal } from '../../hooks/DAO/useCreateSubDAOProposal';
import useDefaultNonce from '../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../providers/Fractal/hooks/useFractal';
import { DAO_ROUTES } from '../../routes/constants';
import { GnosisDAO, TokenGovernanceDAO, SubDAO } from '../../types';

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
