import { Box, Flex, Text, Divider } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFractal } from '../../../../../providers/App/AppProvider';
import { StyledBox } from '../../../../ui/containers/StyledBox';
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
    <Flex
      gap={4}
      alignItems="flex-start"
    >
      <StyledBox
        maxHeight="fit-content"
        minHeight="6.25rem"
        mt={10}
      >
        <Text textStyle="text-lg-mono-medium">{t('governanceTokenTitle')}</Text>
        <Divider
          marginTop="1rem"
          color="chocolate.700"
        />
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
      </StyledBox>
      <StyledBox
        maxHeight="fit-content"
        minHeight="6.25rem"
        mt={10}
      >
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {t('governanceTokenTitle')}
        </Text>
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.200"
        >
          {t('governanceTokenDescription')}
        </Text>
      </StyledBox>
    </Flex>
  );
}
