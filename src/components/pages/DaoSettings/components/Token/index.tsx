import { Box, Flex, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { formatCoin } from '../../../../../utils';
import { DisplayAddress } from '../../../../ui/links/DisplayAddress';
import { BarLoader } from '../../../../ui/loaders/BarLoader';

type TokenData = {
  name: string;
  symbol: string;
  totalSupply: string;
  address: string;
};

export function GovernanceTokenContainer() {
  const [tokenDetails, setTokenDetails] = useState<TokenData>();
  const { t } = useTranslation(['settings']);
  const {
    governanceContracts: { tokenContract },
  } = useFractal();

  useEffect(() => {
    const loadTokenData = async () => {
      if (!tokenContract) return;

      const tokenContractAsProvider = tokenContract.asProvider;
      const symbol = await tokenContractAsProvider.symbol();
      const totalSupply = formatCoin(
        await tokenContractAsProvider.totalSupply(),
        false,
        await tokenContractAsProvider.decimals(),
        symbol,
        false
      );

      const data: TokenData = {
        address: tokenContract.asProvider.address,
        name: await tokenContract.asProvider.name(),
        symbol,
        totalSupply,
      };
      setTokenDetails(data);
    };

    loadTokenData();
  }, [tokenContract]);

  return (
    <SettingsSection
      contentTitle={t('governanceTokenTitle')}
      descriptionTitle={t('governanceTokenTitle')}
      descriptionText={t('governanceTokenDescription')}
    >
      {tokenDetails ? (
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
              <DisplayAddress address={tokenDetails.address}>{tokenDetails.name}</DisplayAddress>
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
              {tokenDetails.symbol}
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
              {tokenDetails.totalSupply}
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
