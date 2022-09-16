import DaoCreator from '../../../components/DaoCreator';
import { useInjector } from '../../../controller/Modules/injectors/GovernanceInjectorConext';

function Fractalize() {
  const { pending, createDAOTrigger } = useInjector();
  return (
    <DaoCreator
      pending={pending}
      deployDAO={createDAOTrigger!}
      isSubDAO
    />
  );
}

export default Fractalize;
