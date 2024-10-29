import { Box, Button, Card, Flex, Hide, Show, Text } from '@chakra-ui/react';
import { Coins, Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import NoDataCard from '../../../../../components/ui/containers/NoDataCard';
import { BarLoader } from '../../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../../components/ui/page/Header/NestedPageHeader';
import { useCanUserCreateProposal } from '../../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../../types';

export default function SafePermissionsSettingsPage() {
  const { t } = useTranslation('settings');
  const {
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
        />
      </Show>
      <Hide below="md"></Hide>
      <Flex
        flexDirection="column"
        gap={4}
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
