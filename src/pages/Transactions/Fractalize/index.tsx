import DaoCreator from '../../../components/DaoCreator';
import { useGovernanceInjector } from '../../../controller/Modules/injectors/GovernanceInjectorConext';

function Fractalize() {
  const { pending, createDAOTrigger } = useGovernanceInjector();
  return (
    <DaoCreator
      pending={pending}
      deployDAO={createDAOTrigger!}
      isSubDAO
    />
  );
}

export default Fractalize;
