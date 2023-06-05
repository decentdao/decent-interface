'use client';

import { Box } from '@chakra-ui/react';
import { CloseX } from '@decent-org/fractal-ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import DaoCreator from '../../../../../src/components/DaoCreator';
import { EmptyBox } from '../../../../../src/components/ui/containers/EmptyBox';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import { GovernanceModuleType, DAOTrigger } from '../../../../../src/types';

export default function ModifyGovernancePage() {
  const {
    node: { daoAddress, safe },
    governance: { type },
    readOnly: { user },
  } = useFractal();
  const { t } = useTranslation(['daoEdit', 'common', 'breadcrumbs']);
  const { push } = useRouter();
  const isMultisig = type === GovernanceModuleType.MULTISIG;
  const isSigner = user.address && safe?.owners.includes(user.address);

  const handleDeployAzorius: DAOTrigger = daoData => {
    console.log('TODO: Deploy Azorius Module', daoData);
  };

  return (
    <Box>
      <PageHeader
        hasDAOLink
        ButtonIcon={CloseX}
        buttonVariant="secondary"
        buttonClick={() => push(DAO_ROUTES.dao.relative(daoAddress))}
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
          mode="edit"
          deployDAO={handleDeployAzorius}
        />
      ) : (
        <EmptyBox emptyText={t('cannotModifyGovernance')} />
      )}
    </Box>
  );
}
