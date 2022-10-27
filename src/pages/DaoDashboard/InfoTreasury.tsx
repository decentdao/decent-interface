import { Box, Flex, Text } from '@chakra-ui/react';
import { Treasury } from '@decent-org/fractal-ui';

interface IDAOGovernance {}

export function InfoTreasury({}: IDAOGovernance) {
  return (
    <Box>
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Treasury />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          Treasury
        </Text>
      </Flex>

      <Text
        textStyle="text-lg-mono-semibold"
        color="grayscale.100"
      >
        {'$34,500'}
      </Text>
    </Box>
  );
}
