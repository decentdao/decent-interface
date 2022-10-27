import { Box, Flex, Text } from '@chakra-ui/react';
import { Govern } from '@decent-org/fractal-ui';

export function InfoGovernance() {
  return (
    <Box>
      <Flex
        alignItems="center"
        gap="0.5rem"
        mb="1rem"
      >
        <Govern />
        <Text
          textStyle="text-sm-sans-regular"
          color="grayscale.100"
        >
          Governance
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
          Type
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {'Multisig'}
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
          Voting Period
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {'3 days'}
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
          Quorum
        </Text>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          {'30%'}
        </Text>
      </Flex>
    </Box>
  );
}
