import { Box, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { useFormikContext } from 'formik';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import RoleFormCreateProposal from '../../../../../components/Roles/forms/RoleFormCreateProposal';
import PageHeader from '../../../../../components/ui/page/Header/PageHeader';
import { SIDEBAR_WIDTH, useHeaderHeight } from '../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { useDaoInfoStore } from '../../../../../store/daoInfo/useDaoInfoStore';
import { RoleFormValues } from '../../../../../types/roles';

export function SafeRolesEditProposalSummaryPage() {
  const headerHeight = useHeaderHeight();
  const navigate = useNavigate();
  const { safe } = useDaoInfoStore();
  const { t } = useTranslation(['roles', 'breadcrumbs']);
  const { addressPrefix } = useNetworkConfig();
  const { values } = useFormikContext<RoleFormValues>();

  const safeAddress = safe?.address;

  // @dev redirects back to roles edit page if no roles are edited (user refresh)
  useEffect(() => {
    const editedRoles = values.hats.filter(hat => !!hat.editedRole);
    if (!editedRoles.length && safeAddress) {
      navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safeAddress));
    }
  }, [values.hats, safeAddress, navigate, addressPrefix]);

  if (!safeAddress) return null;
  return (
    <Box>
      <Show below="md">
        <Portal>
          <Box
            position="fixed"
            top={0}
            h="100vh"
            w="full"
            bg="neutral-1"
            px="1rem"
            pt={headerHeight}
            overflow="scroll"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              my="1.75rem"
            >
              <Flex
                gap="0.5rem"
                alignItems="center"
                aria-label={t('proposalNew', { ns: 'breadcrumbs' })}
                onClick={() => {
                  navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safeAddress));
                }}
              >
                <Icon
                  as={ArrowLeft}
                  boxSize="1.5rem"
                />
                <Text textStyle="display-lg">{t('proposalNew', { ns: 'breadcrumbs' })}</Text>
              </Flex>
            </Flex>
            <RoleFormCreateProposal
              close={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safeAddress))}
            />
          </Box>
        </Portal>
      </Show>
      <Show above="md">
        <Portal>
          <Box
            position="absolute"
            top={`calc(1rem + ${headerHeight})`}
            left={{ base: SIDEBAR_WIDTH, '3xl': `calc(${SIDEBAR_WIDTH} + 9rem)` }}
            bg="neutral-1"
            px="1rem"
            width={{
              base: `calc(100% - ${SIDEBAR_WIDTH})`,
              '3xl': `calc(100% - 9rem - ${SIDEBAR_WIDTH})`,
            }}
            h={`calc(100vh - ${headerHeight})`}
          >
            <PageHeader
              title={t('proposalNew', { ns: 'breadcrumbs' })}
              breadcrumbs={[
                {
                  terminus: t('roles'),
                  path: '',
                },
              ]}
            />
            <RoleFormCreateProposal
              close={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, safeAddress))}
            />
          </Box>
        </Portal>
      </Show>
    </Box>
  );
}
