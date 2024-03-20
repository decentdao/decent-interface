import { Flex, Box, Text } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { erc721Abi } from 'viem';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useEthersProvider } from '../../../providers/Ethers/hooks/useEthersProvider';
import { BigNumberValuePair, ERC721TokenConfig } from '../../../types';
import { BarLoader } from '../../ui/loaders/BarLoader';

type TokenDetails = {
  name: string;
  symbol: string;
  address: string;
};

export default function AzoriusNFTDetail({
  nft,
  hasAddressError,
}: {
  nft: ERC721TokenConfig<BigNumberValuePair>;
  hasAddressError: boolean;
}) {
  const [loading, setLoading] = useState<boolean>();
  const [tokenDetails, setTokenDetails] = useState<TokenDetails>();
  const { t } = useTranslation('daoCreate');

  const provider = useEthersProvider();
  const { displayName } = useDisplayName(tokenDetails?.address, true);

  useEffect(() => {
    const loadNFTDetails = async () => {
      if (hasAddressError) {
        return;
      }

      setLoading(true);
      try {
        if (nft.tokenAddress && ethers.utils.isAddress(nft.tokenAddress)) {
          const tokenContract = new ethers.Contract(nft.tokenAddress, erc721Abi, provider);
          const [name, symbol] = await Promise.all([tokenContract.name(), tokenContract.symbol()]);
          setTokenDetails({
            name,
            symbol,
            address: nft.tokenAddress,
          });
        } else {
          setTokenDetails(undefined);
        }
      } catch (e) {
        setTokenDetails(undefined);
      }
      setLoading(false);
    };

    loadNFTDetails();
  }, [hasAddressError, nft, provider]);

  const showData = !!tokenDetails && !loading && !hasAddressError;

  return (
    <Flex
      flexDirection="column"
      position="relative"
    >
      <Flex justifyContent="space-between">
        <Text color="chocolate.200">{t('nftDetailsToken')}</Text>
        <Box textAlign="right">
          {showData ? (
            <>
              <Text>{tokenDetails.symbol}</Text>
              <Text>{tokenDetails.name}</Text>
              <Text color="chocolate.200">{displayName}</Text>
            </>
          ) : (
            <Text color="chocolate.200">{t('n/a')}</Text>
          )}
        </Box>
      </Flex>
      <Flex
        mt={4}
        justifyContent="space-between"
      >
        <Text color="chocolate.200">{t('nftDetailsWeight')}</Text>
        <Text color={showData && nft.tokenWeight.value ? undefined : 'chocolate.200'}>
          {showData && nft.tokenWeight.value ? nft.tokenWeight.value : t('n/a')}
        </Text>
      </Flex>
      {loading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          opacity={0.8}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <BarLoader />
        </Box>
      )}
    </Flex>
  );
}
