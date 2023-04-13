import { Box, Button, Divider, Flex, HStack, Select, Text, Tooltip, Image } from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import useDefaultNonce from '../../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../../providers/App/AppProvider';
import useRemoveSigner from './hooks/useRemoveSigner';

function RemoveSignerModal({
  close,
  selectedSigner,
  signers,
}: {
  close: () => void;
  selectedSigner: string;
  signers: string[];
}) {
  const {
    node: { daoAddress },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [prevSigner, setPrevSigner] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(0);
  const defaultNonce = useDefaultNonce();

  useEffect(() => {
    setThresholdOptions(Array.from({ length: signers.length - 1 }, (_, i) => i + 1));
  }, [signers]);

  const removeSigner = useRemoveSigner({
    prevSigner: prevSigner,
    signerToRemove: selectedSigner,
    threshold: threshold,
    nonce: defaultNonce,
    daoAddress: daoAddress,
  });

  const onSubmit = async () => {
    await removeSigner();
    if (close) close();
  };

  useEffect(() => {
    const signerIndex = signers.findIndex(signer => signer === selectedSigner);
    setPrevSigner(
      signerIndex > 0 ? signers[signerIndex - 1] : '0x0000000000000000000000000000000000000001'
    );
  }, [selectedSigner, signers]);

  return (
    <Box>
      <Text
        textStyle="text-base-sans-regular"
        color="grayscale.100"
      >
        Review the signer to remove
      </Text>
      <Text
        color="grayscale.600"
        textStyle="text-base-mono-regular"
        // width="26rem"
        bgColor="black.500"
        px={4}
        py={2}
        mt={2}
        rounded="sm"
      >
        {selectedSigner}
      </Text>
      <Divider
        mt={5}
        mb={4}
        borderColor="chocolate.700"
      />
      <HStack>
        <Text
          textStyle="text-base-sans-regular"
          color="grayscale.100"
        >
          Update required signers
        </Text>
        <Flex>
          <Tooltip
            label="Update signers"
            maxW="18rem"
            placement="left"
          >
            <SupportQuestion
              boxSize="1.5rem"
              minWidth="auto"
              mx="2"
              mt="1"
            />
          </Tooltip>
        </Flex>
      </HStack>
      <HStack>
        <Select
          onChange={e => setThreshold(Number(e.target.value))}
          placeholder="Select"
          mt={4}
          width="8rem"
          bgColor="#2c2c2c"
          borderColor="#4d4d4d"
          rounded="sm"
        >
          {thresholdOptions?.map(thresholdOption => (
            <option
              key={thresholdOption}
              value={thresholdOption}
            >
              <Box key={thresholdOption}>{thresholdOption}</Box>
            </option>
          ))}
        </Select>
        <Flex>
          <Text
            textStyle="text-sm-mono-regular"
            color="grayscale.100"
            mt={3}
            ml={2}
          >{`out of ${signers.length - 1} signers required`}</Text>
        </Flex>
      </HStack>
      <HStack
        border="2px solid"
        borderColor="blue.500"
        textStyle="text-sm-mono-regular"
        rounded="md"
        px={2}
        py={3}
        mt={6}
      >
        <Image
          src="/images/alert-triangle.svg"
          alt="alert triangle"
          w="1rem"
          h="1rem"
          ml={3}
          mr={3}
          textColor="blue.500"
        />
        <Text>Access to your organization will be affected</Text>
      </HStack>
      <Button
        isDisabled={!threshold}
        mt={6}
        width="100%"
        onClick={onSubmit}
      >
        Submit
      </Button>
    </Box>
  );
}

export default RemoveSignerModal;
