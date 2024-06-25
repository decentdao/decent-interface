import { Box, Show, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { Card } from '../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { useRolesState } from '../../../../state/useRolesState';

function Roles() {
  const { hatsTree } = useRolesState();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);

  return (
    <Box>
      <PageHeader
        title={t('roles')}
        breadcrumbs={[
          {
            terminus: t('roles', {
              ns: 'roles',
            }),
            path: '',
          },
        ]}
      />
      {hatsTree === undefined && (
        <Card
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <BarLoader />
        </Card>
      )}
      {hatsTree === null && (
        <Card>
          <Text
            textStyle="body-base"
            textAlign="center"
            color="white-alpha-16"
          >
            {t('noRoles')}
          </Text>
        </Card>
      )}
      {/* {hatsTree && ( */}
      <Show above="md">{/* Table */}</Show>
      <Show below="md">
        {/* Role admin not set */}
        <RoleCard />
        {/* Role admin set */}
        <RoleCard />
        {/* Role admin set with steams */}
        <RoleCard />
      </Show>
      {/* )} */}
    </Box>
  );
}

export default Roles;
