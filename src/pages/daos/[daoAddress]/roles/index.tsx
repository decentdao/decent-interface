import { Box, Show, Text } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex, zeroAddress } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import { Card } from '../../../../components/ui/cards/Card';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesState } from '../../../../state/useRolesState';

function Roles() {
  const { hatsTree } = useRolesState();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['roles', 'navigation', 'breadcrumbs', 'dashboard']);
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();

  if (!daoAddress) return null;
  const handleNavigateToRole = (hatId: Hex) =>
    navigate(DAO_ROUTES.rolesDetails.relative(addressPrefix, daoAddress, hatId));

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
        buttonVariant="secondary"
        buttonText={t('editRoles')}
        buttonProps={{
          size: 'sm',
          leftIcon: <Pencil />,
        }}
        buttonClick={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress))}
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
      <Show above="md">
        <RolesTable
          handleRoleClick={handleNavigateToRole}
          roleHats={hatsTree?.roleHats}
        />
      </Show>
      <Show below="md">
        {hatsTree?.roleHats === null && (
          <Card my="0.5rem">
            <Text
              textStyle="body-base"
              textAlign="center"
              color="white-alpha-16"
            >
              {t('noRoles')}
            </Text>
          </Card>
        )}
        {hatsTree &&
          hatsTree.roleHats.map(roleHat => (
            <RoleCard
              key={roleHat.id}
              name={roleHat.name}
              wearerAddress={roleHat.wearer || zeroAddress}
              hatId={roleHat.id}
              handleRoleClick={handleNavigateToRole}
            />
          ))}
      </Show>
      <Outlet />
    </Box>
  );
}

export default Roles;
