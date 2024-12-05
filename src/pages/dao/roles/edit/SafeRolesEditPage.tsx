import * as amplitude from '@amplitude/analytics-browser';
import { Box, Button, Flex, Show } from '@chakra-ui/react';
import { Plus } from '@phosphor-icons/react';
import { useFormikContext } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Hex, toHex } from 'viem';
import { RoleCardEdit } from '../../../../components/Roles/RoleCard';
import { RoleCardLoading } from '../../../../components/Roles/RolePageCard';
import { RolesEditTable } from '../../../../components/Roles/RolesTable';
import NoDataCard from '../../../../components/ui/containers/NoDataCard';
import PageHeader from '../../../../components/ui/page/Header/PageHeader';
import { DAO_ROUTES } from '../../../../constants/routes';
import { getRandomBytes } from '../../../../helpers';
import { useNavigationBlocker } from '../../../../hooks/utils/useNavigationBlocker';
import { analyticsEvents } from '../../../../insights/analyticsEvents';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../../store/daoInfo/useDaoInfoStore';
import { useRolesStore } from '../../../../store/roles/useRolesStore';
import { RoleFormValues } from '../../../../types/roles';

export function SafeRolesEditPage() {
  useEffect(() => {
    amplitude.track(analyticsEvents.RolesEditPageOpened);
  }, []);

  const { t } = useTranslation(['roles', 'navigation', 'modals', 'common']);
  const { safe } = useDaoInfoStore();
  const { addressPrefix } = useNetworkConfig();

  const { values, setFieldValue } = useFormikContext<RoleFormValues>();

  const { hatsTree } = useRolesStore();

  const navigate = useNavigate();

  const [hasEditedRoles, setHasEditedRoles] = useState(false);

  const blocker = useNavigationBlocker({ roleEditPageNavigationBlockerParams: { hasEditedRoles } });

  const safeAddress = safe?.address;
  if (!safeAddress) return null;

  const showRoleEditDetails = (roleId: Hex) => {
    navigate(DAO_ROUTES.rolesEditDetails.relative(addressPrefix, safeAddress, roleId));
  };

  const hatsTreeLoading = hatsTree === undefined;
  const showNoRolesCard = !hatsTreeLoading && (hatsTree === null || hatsTree.roleHats.length === 0);

  return (
    <>
      <Box>
        <PageHeader
          title={t('roles')}
          breadcrumbs={[
            {
              terminus: t('roles'),
              path: DAO_ROUTES.roles.relative(addressPrefix, safeAddress),
            },
            {
              terminus: t('editRoles'),
              path: '',
            },
          ]}
          buttonProps={{
            variant: 'secondary',
            children: t('addRole'),
            size: 'sm',
            gap: 0,
            leftIcon: (
              <Box mr="-0.25rem">
                <Plus size="1rem" />
              </Box>
            ),
            onClick: async () => {
              const newId = toHex(getRandomBytes(), { size: 32 });
              setFieldValue('roleEditing', { id: newId, canCreateProposals: false });
              showRoleEditDetails(newId);
            },
          }}
        />

        <Show above="md">
          <RolesEditTable handleRoleClick={showRoleEditDetails} />
        </Show>
        <Show below="md">
          {hatsTree === undefined && <RoleCardLoading />}
          {showNoRolesCard && values.hats.length === 0 && (
            <NoDataCard
              translationNameSpace="roles"
              emptyText="noRoles"
              emptyTextNotProposer="noRolesNotProposer"
            />
          )}
          {values.hats.map(hat => (
            <RoleCardEdit
              key={hat.id}
              name={hat.name}
              wearerAddress={hat.resolvedWearer}
              editStatus={hat.editedRole?.status}
              handleRoleClick={() => {
                setFieldValue('roleEditing', hat);
                showRoleEditDetails(hat.id);
              }}
              payments={hat.payments}
              isTermed={!!hat.isTermed}
            />
          ))}
        </Show>
      </Box>
      <Flex
        mt="1rem"
        gap="1rem"
        justifyContent="flex-end"
      >
        <Button
          variant="tertiary"
          onClick={() => {
            setHasEditedRoles(values.hats.some(hat => !!hat.editedRole));
            setTimeout(
              () =>
                navigate(DAO_ROUTES.roles.relative(addressPrefix, safeAddress), {
                  replace: true,
                }),
              50,
            );
          }}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          onClick={() => {
            if (blocker.reset) {
              blocker.reset();
            }
            navigate(
              DAO_ROUTES.rolesEditCreateProposalSummary.relative(addressPrefix, safeAddress),
            );
          }}
          isDisabled={!values.hats.some(hat => hat.editedRole)}
        >
          {t('createProposal', { ns: 'modals' })}
        </Button>
      </Flex>
    </>
  );
}
