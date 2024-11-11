import * as amplitude from '@amplitude/analytics-browser';
import { Box, Flex, Show, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate } from 'react-router-dom';
import { Hex } from 'viem';
import { RoleCard } from '../../../../components/pages/Roles/RoleCard';
import { RoleCardLoading } from '../../../../components/pages/Roles/RolePageCard';
import { RolesTable } from '../../../../components/pages/Roles/RolesTable';
import NoDataCard from '../../../../components/ui/containers/NoDataCard';
import {
  HatsLogoIcon,
  SablierLogoIcon,
  VectorLogoIcon,
} from '../../../../components/ui/icons/Icons';
import PencilWithLineIcon from '../../../../components/ui/icons/PencilWithLineIcon';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../../store/roles/useRolesStore';

function Roles() {
  useEffect(() => {
    amplitude.track(analyticsEvents.RolesPageOpened);
  }, []);

  const { hatsTree } = useRolesStore();
  const { addressPrefix } = useNetworkConfig();
  const { t } = useTranslation(['roles']);
  const {
    node: { safe },
  } = useFractal();
  const navigate = useNavigate();

  const { canUserCreateProposal } = useCanUserCreateProposal();
  const safeAddress = safe?.address;

  if (!safeAddress) return null;

  const handleNavigateToRole = (hatId: Hex) =>
    navigate(DAO_ROUTES.rolesDetails.relative(addressPrefix, safeAddress, hatId));

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
                onClick: () => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safeAddress)),
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
            {hatsTree.roleHats.map(roleHat => {
              return (
                <RoleCard
                  key={roleHat.id}
                  name={roleHat.name}
                  isTermed={roleHat.isTermed}
                  wearerAddress={roleHat.wearerAddress}
                  handleRoleClick={() => handleNavigateToRole(roleHat.id)}
                  paymentsCount={roleHat.payments?.filter(p => p.isStreaming()).length || undefined}
                  currentRoleTermStatus={roleHat.roleTerms.currentTerm?.termStatus}
                />
              );
            })}
          </Show>
        </>
      )}

      <Show below="md">
        <Flex
          gap="1rem"
          color="neutral-6"
          alignItems="center"
          mt={7}
        >
          <Text
            fontSize="18px"
            lineHeight="20px"
            fontWeight={450}
            letterSpacing="-0.54px"
          >
            {t('poweredBy', { ns: 'common' })}
          </Text>
          <HatsLogoIcon
            width="36.201px"
            height="13.107px"
          />
          <VectorLogoIcon
            width="12.953px"
            height="12.953px"
          />
          <SablierLogoIcon
            width="50.741px"
            height="13px"
          />
        </Flex>
      </Show>

      <Outlet />
    </Box>
  );
}

export default Roles;
