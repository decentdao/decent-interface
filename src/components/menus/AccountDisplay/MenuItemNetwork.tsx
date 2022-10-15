import { Flex, Box, Text } from '@chakra-ui/react';
import { useWeb3Provider } from '../../../contexts/web3Data/hooks/useWeb3Provider';
import { useChainData } from '../../../hooks/utlities/useChainData';
import { MenuItem } from './MenuItem';

export function MenuItemNetwork({}: {}) {
  const {
    state: { chainId },
  } = useWeb3Provider();

  const { name, color } = useChainData(chainId);
  return (
    <MenuItem>
      <Flex
        direction="column"
        gap="2"
      >
        <Text
          textStyle="text-sm-sans-regular"
          color="chocolate.100"
        >
          Network
        </Text>
        <Flex
          alignItems="center"
          gap="2"
        >
          <Box
            w="4"
            h="4"
            bg={color}
            rounded="full"
          ></Box>
          <Text>{name}</Text>
        </Flex>
      </Flex>
    </MenuItem>
  );
}
