import { Box, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../../types';
import { formatCoin } from '../../../../../utils';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { BarLoader } from '../../../../ui/loaders/BarLoader';

export default function ERC20TokenContainer() {
  const { t } = useTranslation(['settings']);
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { votesToken } = azoriusGovernance;

  return (
    <SettingsSection
      contentTitle={t('governanceTokenTitle')}
      descriptionTitle={t('governanceTokenTitle')}
      descriptionText={t('governanceTokenDescription')}
    >
      {votesToken ? (
        <Flex
          justifyContent="space-between"
          mt={4}
        >
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenNameLabel')}
            </Text>
            <Box mt={2}>
              <DisplayAddress address={votesToken.address}>{votesToken.name}</DisplayAddress>
            </Box>
          </Box>
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenSymbolLabel')}
            </Text>
            <Text
              textStyle="text-base-sans-regular"
              color="grayscale.100"
              mt={2}
            >
              {votesToken.symbol}
            </Text>
          </Box>
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenSupplyLabel')}
            </Text>
            <Text
              textStyle="text-base-sans-regular"
              color="grayscale.100"
              mt={2}
            >
              {formatCoin(
                votesToken.totalSupply,
                false,
                votesToken.decimals,
                votesToken.symbol,
                false
              )}
            </Text>
          </Box>
        </Flex>
      ) : (
        <Flex
          width="100%"
          justifyContent="center"
          alignItems="center"
          minHeight="100px"
        >
          <BarLoader />
        </Flex>
      )}
    </SettingsSection>
  );
}
