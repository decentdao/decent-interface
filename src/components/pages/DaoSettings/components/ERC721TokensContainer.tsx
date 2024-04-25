import { Flex, Text, Grid, GridItem } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../providers/App/AppProvider';
import { AzoriusGovernance } from '../../../../types';
import { DisplayAddress } from '../../../ui/links/DisplayAddress';
import { BarLoader } from '../../../ui/loaders/BarLoader';
import { SettingsSection } from './SettingsSection';

export function ERC721TokensContainer() {
  const { t } = useTranslation(['settings']);
  const { governance } = useFractal();

  const azoriusGovernance = governance as AzoriusGovernance;
  const { erc721Tokens } = azoriusGovernance;

  return (
    <SettingsSection
      title={t('governanceERC721TokenTitle')}
      descriptionTitle={t('governanceERC721TokenTitle')}
      descriptionText={t('governanceERC721TokenDescription')}
    >
      {erc721Tokens ? (
        <Flex flexWrap="wrap">
          <Grid
            templateColumns="repeat(5, 1fr)"
            width="100%"
            mt={4}
          >
            <GridItem colSpan={2}>
              <Text
                textStyle="text-sm-mono-regular"
                color="chocolate.200"
              >
                {t('governanceTokenNameLabel')}
              </Text>
            </GridItem>
            <GridItem colSpan={1}>
              <Text
                textStyle="text-sm-mono-regular"
                color="chocolate.200"
              >
                {t('governanceTokenSymbolLabel')}
              </Text>
            </GridItem>
            <GridItem colSpan={1}>
              <Text
                textStyle="text-sm-mono-regular"
                color="chocolate.200"
              >
                {t('governanceTokenWeightLabel')}
              </Text>
            </GridItem>
            <GridItem colSpan={1}>
              <Text
                textStyle="text-sm-mono-regular"
                color="chocolate.200"
              >
                {t('governanceTokenTotalWeightLabel')}
              </Text>
            </GridItem>
          </Grid>
          {erc721Tokens.map(token => (
            <Grid
              key={token.address}
              width="100%"
              templateColumns="repeat(5, 1fr)"
              mt={2}
            >
              <GridItem colSpan={2}>
                <DisplayAddress address={token.address}>{token.name}</DisplayAddress>
              </GridItem>
              <GridItem colSpan={1}>
                <Text
                  textStyle="text-base-sans-regular"
                  color="grayscale.100"
                >
                  {token.symbol}
                </Text>
              </GridItem>
              <GridItem colSpan={1}>
                <Text
                  textStyle="text-base-sans-regular"
                  color="grayscale.100"
                >
                  {token.votingWeight.toString()}
                </Text>
              </GridItem>
              <GridItem colSpan={1}>
                <Text
                  textStyle="text-base-sans-regular"
                  color="grayscale.100"
                >
                  {token.totalSupply ? (token.totalSupply * token.votingWeight).toString() : 'n/a'}
                </Text>
              </GridItem>
            </Grid>
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
