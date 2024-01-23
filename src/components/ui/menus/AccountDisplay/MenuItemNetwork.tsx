import { Box, Flex, Select, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSwitchNetwork } from 'wagmi';
import {
  supportedChains,
  useNetworkConfig,
} from '../../../../providers/NetworkConfig/NetworkConfigProvider';

/**
 * Network display for menu
 */
export function MenuItemNetwork() {
  const { t } = useTranslation('menu');
  const { chainId } = useNetworkConfig();
  const { switchNetwork } = useSwitchNetwork();

  if (!switchNetwork) {
    return null;
  }

  return (
    <Box
      cursor="default"
      p="1rem 1.5rem"
    >
      <Flex
        direction="column"
        gap="2"
      >
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.100"
        >
          {t('network')}
        </Text>
        <Select
          mt={4}
          width="100%"
          bgColor="#2c2c2c"
          borderColor="#4d4d4d"
          data-testid="accountMenu-network"
          rounded="sm"
          cursor="pointer"
          onChange={async e => {
            e.preventDefault();
            switchNetwork(Number(e.target.value));
          }}
          value={chainId}
        >
          {supportedChains.map(chain => (
            <option
              key={chain.chainId}
              value={chain.chainId}
            >
              <Box
                w="1rem"
                h="1rem"
                bg={chain.color}
                rounded="full"
              />
              <Text textStyle="text-base-mono-medium">{chain.name}</Text>
            </option>
          ))}
        </Select>
      </Flex>
    </Box>
  );
}
