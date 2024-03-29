import { Box } from '@chakra-ui/react';
import { CloseX } from '@decent-org/fractal-ui';

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
    node: { daoAddress, safe, daoName, daoSnapshotURL },
    governance: { type },
    readOnly: { user },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['daoEdit', 'common', 'breadcrumbs']);
  const navigate = useNavigate();
  const isMultisig = type === GovernanceType.MULTISIG;
  const isSigner = user.address && safe?.owners.includes(user.address);
  const deployAzorius = useDeployAzorius();

  const handleDeployAzorius: DAOTrigger = daoData => {
    deployAzorius(
      daoData as AzoriusERC20DAO | AzoriusERC721DAO,
      !daoName || createAccountSubstring(daoAddress!) === daoName,
      !daoSnapshotURL && !!daoData.snapshotURL,
    );
  };

  if (!daoAddress) {
    return null;
  }

  return (
    <Box>
      <PageHeader
        hasDAOLink
        ButtonIcon={CloseX}
        buttonVariant="secondary"
        buttonClick={() => navigate(DAO_ROUTES.dao.relative(addressPrefix, daoAddress))}
        isButtonDisabled={false}
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
