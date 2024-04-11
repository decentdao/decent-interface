import { Box, Flex, Select, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSwitchChain } from 'wagmi';
import {
  supportedNetworks,
  useNetworkConfig,
} from '../../../../providers/NetworkConfig/NetworkConfigProvider';

/**
 * Network display for menu
 */
export function MenuItemNetwork() {
  const { t } = useTranslation('menu');
  const { chain } = useNetworkConfig();
  const { switchChain } = useSwitchChain();

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
            switchChain({ chainId: Number(e.target.value) });
          }}
          value={chain.id}
        >
          {supportedNetworks.map(network => (
            <option
              key={network.chain.id}
              value={network.chain.id}
            >
              {network.chain.name}
            </option>
          ))}
        </Select>
      </Flex>
    </Box>
  );
}
