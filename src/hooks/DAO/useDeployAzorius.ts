import { useTranslation } from 'react-i18next';
import { useFractal } from '../../providers/App/AppProvider';
import { useTransaction } from '../utils/useTransaction';

const useDeployAzorius = () => {
  const {
    baseContracts: { multiSendContract },
  } = useFractal();
  const [contractCallDeploy, contractCallPending] = useTransaction();

  const { t } = useTranslation('transaction');
};

export default useDeployAzorius;
