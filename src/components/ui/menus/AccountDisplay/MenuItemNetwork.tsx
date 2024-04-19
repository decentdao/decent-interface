import { Box, Flex, Select, Text } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
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
      bg="neutral-3"
      pt="0.5rem"
    >
      <Flex
        direction="column"
        gap="2"
        // @dev Not my favorite way to do this, but it's the only way to target the icon and adjust the margin without using a custom theme
        sx={{
          '.chakra-select__icon-wrapper': {
            'margin-right': '0.5rem',
          },
          '*:hover': {
            'color': 'lilac--1',
          },
        }}
      >
        <Text
          px="0.5rem"
          textStyle="helper-text-small"
          color="neutral-7"
        >
          {t('network')}
        </Text>
        <Select
          h="3rem"
          bgColor="transparent"
          border="none"
          _hover={{
            bg: 'white-alpha-04',
          }}
          _focus={{
            border: 'none',
            bg: 'white-alpha-08',
            color: 'lilac--2',
            boxShadow: 'none',
          }}
          _active={{
            border: 'none',
            bg: 'white-alpha-08',
            color: 'lilac--2',
          }}
          data-testid="accountMenu-network"
          cursor="pointer"
          iconSize="1.5rem"
          icon={<CaretDown />}
          borderRadius="4px"
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
