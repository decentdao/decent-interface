import { Box, Divider, Stack, Text, Image, Spacer, Flex } from '@chakra-ui/react';

function DaoDetails({
  threshold,
  signerCount,
}: {
  threshold: number | undefined;
  signerCount: number | undefined;
}) {
  if (!threshold || !signerCount) return <></>;

  return (
    <Box
      bg="black.900-semi-transparent"
      rounded="md"
      px={8}
      py={8}
      maxWidth="30rem"
    >
      <Text
        textStyle="text-lg-mono-regular"
        color="grayscale.100"
      >
        DAO Details
      </Text>
      <Divider
        marginTop="1rem"
        borderColor="chocolate.400"
      />
      <Flex mt={4}>
        <Box>
          <Text
            textStyle="text-base-sans-regular"
            color="chocolate.200"
          >
            Signers Required
          </Text>
        </Box>
        <Spacer />
        <Box>
          <Text
            textStyle="text-base-sans-regular"
            color="grayscale.100"
          >{`${threshold}/${signerCount}`}</Text>
        </Box>
      </Flex>
      <Stack
        direction="row"
        mt={2}
      >
        <Image
          src="/images/alert-triangle.svg"
          alt="alert triangle"
          w="1.5rem"
          h="1.5rem"
          mt={3}
          mr={1}
        />
        <Stack direction="column">
          <Text
            textStyle="text-sm-sans-regular"
            color="chocolate.200"
            mt={2}
          >
            The number of signers required to execute a proposal.
            <br />
            Adding or removing a signer will require an update.
          </Text>
        </Stack>
      </Stack>
    </Box>
  );
}

export default DaoDetails;
