import { Box, Flex, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsSection } from '..';
import { useFractal } from '../../../../../providers/App/AppProvider';
import EtherscanLinkERC20 from '../../../../ui/links/EtherscanLinkERC20';
import { BarLoader } from '../../../../ui/loaders/BarLoader';

type TokenData = {
  name: string;
  symbol: string;
  totalSupply: number;
  totalDelegated: number;
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

      const data: TokenData = {
        address: tokenContract.asProvider.address,
        name: await tokenContract.asProvider.name(),
        symbol: await tokenContract.asProvider.symbol(),
        totalSupply: (await tokenContract.asProvider.totalSupply()).toNumber(),
        totalDelegated: (await tokenContract.asProvider.totalSupply()).toNumber(), // TODO: Seems like there's no way to easily "get" it and we need to derive this total from events?
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
        <Flex justifyContent="space-between">
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenNameLabel')}
            </Text>
            <EtherscanLinkERC20 address={tokenDetails.address}>
              {tokenDetails.name}
            </EtherscanLinkERC20>
          </Box>
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenSymbolLabel')}
            </Text>
            <Text
              textStyle="text-sm-mono-regular"
              color="grayscale.100"
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
              textStyle="text-sm-mono-regular"
              color="grayscale.100"
            >
              {tokenDetails.totalSupply}
            </Text>
          </Box>
          <Box>
            <Text
              textStyle="text-sm-mono-regular"
              color="chocolate.200"
            >
              {t('governanceTokenDelegatedLabel')}
            </Text>
            <Text
              textStyle="text-sm-mono-regular"
              color="grayscale.100"
            >
              {tokenDetails.totalDelegated}
            </Text>
          </Box>
        </Flex>
      ) : (
        <BarLoader />
      )}
    </SettingsSection>
  );
}
