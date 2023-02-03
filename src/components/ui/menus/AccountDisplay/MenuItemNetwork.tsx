import { Box, Flex, MenuItem, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNetworkConfg } from '../../../../providers/NetworkConfig/NetworkConfigProvider';

/**
 * Network display for menu
 */
export function MenuItemNetwork() {
  const { nameKey, color } = useNetworkConfg();
  const { t } = useTranslation('menu');
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
        <MenuItem
          padding={0}
          alignItems="center"
          gap="2"
        >
          <Box
            w="1rem"
            h="1rem"
            bg={color}
            rounded="full"
          />
          <Text
            data-testid="accountMenu-network"
            textStyle="text-base-mono-medium"
          >
            {t(nameKey)}
          </Text>
        </MenuItem>
      </Flex>
    </Box>
  );
}
