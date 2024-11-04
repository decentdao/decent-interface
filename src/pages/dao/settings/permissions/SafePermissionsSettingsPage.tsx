import { Box, Button, Flex, IconButton, Show, Text } from '@chakra-ui/react';
import { Coins, Plus } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { zeroAddress } from 'viem';
import { Card } from '../../../../components/ui/cards/Card';
import NoDataCard from '../../../../components/ui/containers/NoDataCard';
import PencilWithLineIcon from '../../../../components/ui/icons/PencilWithLineIcon';
import { BarLoader } from '../../../../components/ui/loaders/BarLoader';
import NestedPageHeader from '../../../../components/ui/page/Header/NestedPageHeader';
import { NEUTRAL_2_84 } from '../../../../constants/common';
import { DAO_ROUTES } from '../../../../constants/routes';
import { useCanUserCreateProposal } from '../../../../hooks/utils/useCanUserSubmitProposal';
import { useFractal } from '../../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../../providers/NetworkConfig/NetworkConfigProvider';
import { AzoriusGovernance } from '../../../../types';
import { SettingsContentBox } from '../SettingsContentBox';

export function SafePermissionsSettingsPage() {
  const { t } = useTranslation('settings');
  const navigate = useNavigate();
  const { addressPrefix } = useNetworkConfig();
  const {
    node: { daoAddress },
    governance,
    governanceContracts: { isLoaded, linearVotingErc20Address },
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
      <SettingsContentBox
        flexDirection="column"
        gap={{ base: 4, md: 6 }}
        display="flex"
        bg={{ base: 'transparent', md: NEUTRAL_2_84 }}
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
        ) : !votesToken || !linearVotingErc20Address ? (
          <NoDataCard
            emptyText="emptyPermissions"
            emptyTextNotProposer="emptyPermissionsNotProposer"
            translationNameSpace="settings"
          />
        ) : (
          <Card
            onClick={
              canUserCreateProposal && linearVotingErc20Address
                ? () =>
                    navigate(
                      DAO_ROUTES.settingsPermissionsCreateProposal.relative(
                        addressPrefix,
                        daoAddress || zeroAddress,
                        linearVotingErc20Address,
                      ),
                    )
                : undefined
            }
            sx={{
              _hover: {
                backgroundColor: 'neutral-3',
                button: {
                  opacity: 1,
                },
              },
            }}
          >
            <Flex justifyContent="space-between">
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
              <IconButton
                variant="secondary"
                size="icon-md"
                icon={<PencilWithLineIcon />}
                aria-label={t('edit')}
                opacity={0}
                color="neutral-6"
                border="none"
              />
            </Flex>
          </Card>
        )}
      </SettingsContentBox>
    </>
  );
}
