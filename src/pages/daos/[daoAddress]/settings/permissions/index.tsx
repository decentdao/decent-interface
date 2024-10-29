import { Box, Button, Card, Flex, Show, Text } from '@chakra-ui/react';
import { Coins, Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { zeroAddress } from 'viem';
import NoDataCard from '../../../../../components/ui/containers/NoDataCard';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../../components/ui/page/Header/NestedPageHeader';
import { DAO_ROUTES } from '../../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../../providers/NetworkConfig/NetworkConfigProvider';
import { AzoriusGovernance } from '../../../../../types';

export default function SafePermissionsSettingsPage() {
  const { t } = useTranslation('settings');
  const { addressPrefix } = useNetworkConfig();
  const {
    node: { daoAddress },
    governance,
    governanceContracts: { isLoaded },
  } = useFractal();

  const { canUserCreateProposal } = useCanUserCreateProposal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken } = azoriusGovernance;
  
  return (
    <>
      <Show below="md">
        <NestedPageHeader
          title={t('permissionsTitle')}
          backButtonText={t('settings')}
          backButtonHref={DAO_ROUTES.settings.relative(addressPrefix, daoAddress || zeroAddress)}
        />
      </Show>
      <Flex
        flexDirection="column"
        gap={{ base: 4, md: 6 }}
        width="100%"
        borderWidth={{ base: '0px', md: '1px' }}
        borderColor="neutral-3"
        borderRadius="0.75rem"
        padding={{ base: 0, md: 6 }}
      >
        {canUserCreateProposal && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus />}
            width="max-content"
          >
            {t('addPermission')}
          </Button>
        )}
        {!isLoaded ? (
          <Card
            my="0.5rem"
            justifyContent="center"
            display="flex"
          >
            <BarLoader />
          </Card>
        ) : !votesToken ? (
          <NoDataCard
            emptyText="emptyPermissions"
            emptyTextNotProposer="emptyPermissionsNotProposer"
            translationNameSpace="settings"
          />
        ) : (
          <Card>
            <Flex
              gap={4}
              alignItems="flex-start"
            >
              <Box
                borderRadius="50%"
                bg="neutral-3"
                color="lilac-0"
                padding={1}
              >
                <Coins fontSize="1.5rem" />
              </Box>
              <Box>
                <Text>{t('permissionCreateProposalsTitle')}</Text>
                <Text
                  textStyle="button-small"
                  color="neutral-7"
                >
                  {t('permissionsCreateProposalsDescription', {
                    symbol: votesToken.symbol,
                    tokensCount: azoriusGovernance.votingStrategy?.proposerThreshold?.formatted,
                  })}
                </Text>
              </Box>
            </Flex>
          </Card>
        )}
      </Flex>
    </>
  );
}
