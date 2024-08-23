import { Box, Show } from '@chakra-ui/react';
import { Pencil } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex, zeroAddress } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RoleCardLoading, RoleCardNoRoles } from '../../../../components/pages/Roles/RolePageCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../store/roles';

function Roles() {
  const { hatsTree } = useRolesStore();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['roles']);
  const {
    node: { daoAddress },
  } = useFractal();
  const navigate = useNavigate();

  const { canUserCreateProposal } = useCanUserCreateProposal();

  if (!daoAddress) return null;

  const handleNavigateToRole = (hatId: Hex) =>
    navigate(DAO_ROUTES.rolesDetails.relative(addressPrefix, daoAddress, hatId));

  const hatsTreeLoading = hatsTree === undefined;
  const showNoRolesCard = !hatsTreeLoading && (hatsTree === null || hatsTree.roleHats.length === 0);
  const showRolesTable = !hatsTreeLoading && hatsTree !== null && hatsTree.roleHats.length > 0;

  return (
    <Box>
      <PageHeader
        title={t('roles')}
        breadcrumbs={[
          {
            terminus: t('roles'),
            path: '',
          },
        ]}
        buttonVariant="secondary"
        buttonText={canUserCreateProposal ? t('editRoles') : undefined}
        buttonProps={{
          size: 'sm',
          leftIcon: <Pencil />,
        }}
        buttonClick={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress))}
      />
      {hatsTreeLoading && <RoleCardLoading />}
      {showNoRolesCard && <RoleCardNoRoles />}

      {showRolesTable && (
        <>
          <Show above="md">
            <RolesTable
              handleRoleClick={handleNavigateToRole}
              hatsTree={hatsTree}
            />
          </Show>

          <Show below="md">
            {hatsTree.roleHats.map(roleHat => (
              <RoleCard
                key={roleHat.id}
                name={roleHat.name}
                wearerAddress={roleHat.wearer || zeroAddress}
                hatId={roleHat.id}
                handleRoleClick={handleNavigateToRole}
                paymentsCount={roleHat.payments?.filter(p => p.isStreaming()).length || undefined}
              />
            ))}
          </Show>
        </>
      )}
      <Outlet />
    </Box>
  );
}

export default Roles;
