import { Box, Button, Divider, Flex, HStack, Select, Text, Image, Tooltip } from '@chakra-ui/react';
import { LabelWrapper, SupportQuestion } from '@decent-org/fractal-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDefaultNonce from '../../../hooks/DAO/useDefaultNonce';
import { useFractal } from '../../../providers/App/AppProvider';
import { EthAddressInput } from '../../ui/forms/EthAddressInput';
import useAddSigner from './hooks/useAddSigner';

function AddSignerModal({ close, signerCount }: { close: () => void; signerCount: number }) {
  const {
    node: { daoAddress },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [newSigner, setNewSigner] = useState<string>('');
  const [threshold, setThreshold] = useState<number>();
  const defaultNonce = useDefaultNonce();
  const { t } = useTranslation(['modals', 'common']);

  const [isValidAddress, setIsValidAddress] = useState<boolean>(false);
  const newSignerError =
    newSigner && !isValidAddress ? t('errorInvalidAddress', { ns: 'common' }) : undefined;

  useEffect(() => {
    setThresholdOptions(Array.from({ length: signerCount + 1 }, (_, i) => i + 1));
  }, [signerCount]);

  const addSigner = useAddSigner({
    newSigner: newSigner,
    threshold: threshold,
    nonce: defaultNonce,
    daoAddress: daoAddress,
  });

  const onSubmit = async () => {
    await addSigner();
    if (close) close();
  };

  console.log('threshold: ', threshold === 0);

  return (
    <Box>
      <Text
        textStyle="text-base-sans-regular"
        color="grayscale.100"
      >
        Add a new signer to your Safe
      </Text>
      <LabelWrapper
        // label="Add a new signer to your Safe"
        subLabel="Ethereum wallet address or ENS only"
        errorMessage={newSignerError}
      >
        <EthAddressInput
          onAddressChange={function (address: string, isValid: boolean): void {
            setIsValidAddress(isValid);
            setNewSigner(address);
          }}
        />
      </LabelWrapper>
      <Divider
        mt={6}
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
              {thresholdOption}
            </option>
          ))}
        </Select>
        <Flex>
          <Text
            textStyle="text-sm-mono-regular"
            color="grayscale.100"
            mt={3}
            ml={2}
          >{`out of ${signerCount + 1} signers required`}</Text>
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
        isDisabled={!newSigner || !!newSignerError || !threshold}
        mt={6}
        width="100%"
        onClick={onSubmit}
      >
        Submit
      </Button>
    </Box>
  );
}

export default AddSignerModal;
