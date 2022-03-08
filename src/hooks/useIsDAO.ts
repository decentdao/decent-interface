import use165Contract from './use165Contract';
import {
  IDAO__factory,
  IDAOModuleBase__factory,
} from '../typechain';
import useSupportsInterfaces from './useSupportsInterfaces';

const useIsDAO = (address: string | undefined) => {
  const contract = use165Contract(address);
  const interfaces = [IDAO__factory.createInterface(), IDAOModuleBase__factory.createInterface()];
  const isDAO = useSupportsInterfaces(contract, interfaces);
  return isDAO;
}

export default useIsDAO;
