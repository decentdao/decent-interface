import * as amplitude from '@amplitude/analytics-browser';
import { Box, Show } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { RoleCard } from '../../../components/Roles/RoleCard';
import { RoleCardLoading } from '../../../components/Roles/RolePageCard';
import { RolesTable } from '../../../components/Roles/RolesTable';
import NoDataCard from '../../../components/ui/containers/NoDataCard';
import PencilWithLineIcon from '../../../components/ui/icons/PencilWithLineIcon';
import PageHeader from '../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../constants/routes';
import { useCanUserCreateProposal } from '../../../hooks/utils/useCanUserSubmitProposal';
import { analyticsEvents } from '../../../insights/analyticsEvents';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles/useRolesStore';

export function SafeRolesPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.RolesPageOpened);
  }, []);

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
        buttonProps={
          canUserCreateProposal
            ? {
                variant: 'secondary',
                size: 'sm',
                leftIcon: (
                  <Box mr="-0.25rem">
                    <PencilWithLineIcon
                      w="1rem"
                      h="1rem"
                    />
                  </Box>
                ),
                gap: 0,
                children: t('editRoles'),
                onClick: () => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress)),
              }
            : undefined
        }
      />
      {hatsTreeLoading && <RoleCardLoading />}
      {showNoRolesCard && (
        <NoDataCard
          translationNameSpace="roles"
          emptyText="noRoles"
          emptyTextNotProposer="noRolesNotProposer"
        />
      )}

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
                wearerAddress={roleHat.wearerAddress}
                handleRoleClick={() => handleNavigateToRole(roleHat.id)}
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
