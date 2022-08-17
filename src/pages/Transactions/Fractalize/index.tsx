import DaoCreator from '../../../components/DaoCreator';
import { DAOTrigger } from '../../../components/DaoCreator/provider/types';

import { GovernanceProposalData } from '../../../controller/Modules/types';
interface IFractalize extends GovernanceProposalData {
  createDAOTrigger?: DAOTrigger;
}

function Fractalize({ createDAOTrigger, pending }: IFractalize) {
  return (
    <DaoCreator
      pending={pending}
      deployDAO={createDAOTrigger!}
      isSubDAO
    />
  );
}

export default Fractalize;
