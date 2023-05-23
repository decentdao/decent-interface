'use client';

import { Box } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { EmptyBox } from '../../../../../src/components/ui/containers/EmptyBox';
import PageHeader from '../../../../../src/components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../../src/constants/routes';
import { useFractal } from '../../../../../src/providers/App/AppProvider';
import { GovernanceModuleType } from '../../../../../src/types';

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

  return (
    <Box>
      <PageHeader
        title={'Establish Essentials'}
        hasDAOLink
        buttonText={t('cancel', { ns: 'common' })}
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
        <Box>TODO: Put DAO creator form</Box>
      ) : (
        <EmptyBox emptyText={t('cannotModifyGovernance')} />
      )}
    </Box>
  );
}
