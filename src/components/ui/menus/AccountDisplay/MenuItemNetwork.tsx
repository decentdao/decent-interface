import { Box, Flex, Select, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSwitchChain } from 'wagmi';
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
          value={chainId}
        >
          {supportedChains.map(chain => (
            <option
              key={chain.chainId}
              value={chain.chainId}
            >
              {chain.name}
            </option>
          ))}
        </Select>
      </Flex>
    </Box>
  );
}
