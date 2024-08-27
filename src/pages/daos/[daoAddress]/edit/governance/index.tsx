import { Box } from '@chakra-ui/react';
import { X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DaoCreator from '../../../../../components/DaoCreator';
import { DAOCreateMode } from '../../../../../components/DaoCreator/formComponents/EstablishEssentials';
import { EmptyBox } from '../../../../../components/ui/containers/EmptyBox';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import useDeployAzorius from '../../../../../hooks/DAO/useDeployAzorius';
import { createAccountSubstring } from '../../../../../hooks/utils/useDisplayName';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import {
  DAOTrigger,
  AzoriusERC20DAO,
  AzoriusERC721DAO,
  GovernanceType,
} from '../../../../../types';

export default function ModifyGovernancePage() {
  const {
    node: { safe, daoName, daoSnapshotENS },
    governance: { type },
    readOnly: { user },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['daoEdit', 'common', 'breadcrumbs']);
  const navigate = useNavigate();
  const isMultisig = type === GovernanceType.MULTISIG;
  const isSigner = user.address && safe?.owners.includes(user.address);
  const deployAzorius = useDeployAzorius();

  const safeAddress = safe?.address;

  const handleDeployAzorius: DAOTrigger = (daoData, customNonce) => {
    deployAzorius(
      daoData as AzoriusERC20DAO | AzoriusERC721DAO,
      !daoName || createAccountSubstring(safeAddress!) === daoName,
      !daoSnapshotENS && !!daoData.snapshotENS,
      customNonce,
    );
  };

  if (!safeAddress) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        hasDAOLink
        ButtonIcon={X}
        buttonProps={{
          variant: 'secondary',
          onClick: () => navigate(DAO_ROUTES.dao.relative(addressPrefix, safeAddress)),
        }}
        breadcrumbs={[
          {
            terminus: t('modifyGovernance', { ns: 'breadcrumbs' }),
            path: '',
          },
        ]}
      />
      {isMultisig && isSigner ? (
        <DaoCreator
          pending={false}
          mode={DAOCreateMode.EDIT}
          deployDAO={handleDeployAzorius}
        />
      ) : (
        <EmptyBox emptyText={t('cannotModifyGovernance')} />
      )}
    </Box>
  );
}
