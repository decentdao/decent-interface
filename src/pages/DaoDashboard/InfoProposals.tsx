import { Box, Flex, Text } from '@chakra-ui/react';
import { Proposals } from '@decent-org/fractal-ui';

interface IDAOGovernance {}

export function InfoProposals({}: IDAOGovernance) {
  return (
    <Box>
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Proposals />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          Proposals
        </Text>
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text
          textStyle="text-base-sans-regular"
          color="chocolate.200"
        >
          Pending
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {'13'}
        </Text>
      </Flex>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        mb="0.25rem"
      >
        <Text
          textStyle="text-base-sans-regular"
          color="chocolate.200"
        >
          Passed
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {'23'}
        </Text>
      </Flex>
    </Box>
  );
}
