import { Flex, Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../../types';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { BarLoader } from '../../../../ui/loaders/BarLoader';

export default function ERC721TokensContainer() {
  const { t } = useTranslation(['settings']);
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  return (
    <SettingsSection
      contentTitle={t('governanceTokenTitle')}
      descriptionTitle={t('governanceTokenTitle')}
      descriptionText={t('governanceTokenDescription')}
    >
      {erc721Tokens ? (
        <Flex flexWrap="wrap">
          {erc721Tokens.map(token => (
            <Flex
              key={token.address}
              justifyContent="space-between"
              width="100%"
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
                  <DisplayAddress address={token.address}>{token.name}</DisplayAddress>
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
                  {token.symbol}
                </Text>
              </Box>
              <Box>
                <Text
                  textStyle="text-sm-mono-regular"
                  color="chocolate.200"
                >
                  {t('governanceTokenWeightLabel')}
                </Text>
                <Text
                  textStyle="text-base-sans-regular"
                  color="grayscale.100"
                  mt={2}
                >
                  {token.votingWeight.toString()}
                </Text>
              </Box>
              {token.totalSupply && (
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
                    {token.totalSupply.toString()}
                  </Text>
                </Box>
              )}
            </Flex>
          ))}
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
