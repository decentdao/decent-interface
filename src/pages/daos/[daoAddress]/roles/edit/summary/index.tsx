import { Box, Flex, Icon, Portal, Show, Text } from '@chakra-ui/react';
import { ArrowLeft } from '@phosphor-icons/react';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import RoleFormCreateProposal from '../../../../../../components/pages/Roles/forms/RoleFormCreateProposal';
import { useHeaderHeight } from '../../../../../../constants/common';
import { DAO_ROUTES } from '../../../../../../constants/routes';
import { useFractal } from '../../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../../providers/NetworkConfig/NetworkConfigProvider';

export default function EditProposalSummary() {
  const headerHeight = useHeaderHeight();
  const navigate = useNavigate();
  const {
    node: { daoAddress },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  if (!daoAddress) return null;
  return (
    <Box>
      <Show below="md">
        <Portal>
          <Box
            position="fixed"
            top={headerHeight}
            h={`100vh`}
            w="full"
            bg="neutral-1"
            px="1rem"
          >
            <Flex
              justifyContent="space-between"
              alignItems="center"
              my="1.75rem"
            >
              <Flex
                gap="0.5rem"
                alignItems="center"
                aria-label={t('proposalNew')}
                onClick={() => {
                  navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress));
                }}
              >
                <Icon
                  as={ArrowLeft}
                  boxSize="1.5rem"
                />
                <Text textStyle="display-lg">{t('proposalNew', { ns: 'breadcrumbs' })}</Text>
              </Flex>
            </Flex>
            <RoleFormCreateProposal close={() => navigate(DAO_ROUTES.rolesEdit.relative(addressPrefix, daoAddress))} />
          </Box>
        </Portal>
      </Show>
    </Box>
  );
}
