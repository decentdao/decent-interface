import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { Coins, Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../types';
import { Card } from '../../../ui/cards/Card';
import NoDataCard from '../../../ui/containers/NoDataCard';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { SettingsSection } from './SettingsSection';

export function PermissionsContent() {
  const { t } = useTranslation('settings');
  const {
    governance,
    governanceContracts: { isLoaded },
  } = useFractal();

  const { canUserCreateProposal } = useCanUserCreateProposal();
  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken } = azoriusGovernance;

  if (!isLoaded) {
    return (
      <Card
        my="0.5rem"
        justifyContent="center"
        display="flex"
      >
        <BarLoader />
      </Card>
    );
  }

  if (!votesToken) {
    return (
      <NoDataCard
        emptyText="emptyPermissions"
        emptyTextNotProposer="emptyPermissionsNotProposer"
        translationNameSpace="settings"
      />
    );
  }

  return (
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
    </Flex>
  );
}

export default function PermissionsContainer() {
  // @todo - temporary implementation till we'll have proper desktop designs
  return (
    <SettingsSection
      title="Permissions"
      descriptionHeader="Permissions (Proposal Creation Whitelisting)"
      descriptionContent="These permissions are granting some permissions like permission to create proposals, ya know"
    >
      <PermissionsContent />
    </SettingsSection>
  );
}
