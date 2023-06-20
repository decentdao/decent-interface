import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Select,
  Text,
  Image,
  AlertTitle,
  Alert,
} from '@chakra-ui/react';
import { SupportQuestion } from '@decent-org/fractal-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address, useEnsName, useProvider } from 'wagmi';
import { TOOLTIP_MAXW } from '../../../constants/common';
import { useFractal } from '../../../providers/App/AppProvider';
import { CustomNonceInput } from '../../ui/forms/CustomNonceInput';
import ModalTooltip from '../../ui/modals/ModalTooltip';
import useRemoveSigner from './hooks/useRemoveSigner';

function RemoveSignerModal({
  close,
  selectedSigner,
  signers,
  currentThreshold,
}: {
  close: () => void;
  selectedSigner: string;
  signers: string[];
  currentThreshold: number;
}) {
  const {
    node: { daoAddress, safe },
  } = useFractal();
  const [thresholdOptions, setThresholdOptions] = useState<number[]>();
  const [prevSigner, setPrevSigner] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(currentThreshold);
  const [nonce, setNonce] = useState<number | undefined>(safe!.nonce);
  const provider = useProvider();
  const networkId = provider.network.chainId;
  const { data: ensName } = useEnsName({
    address: selectedSigner as Address,
    chainId: networkId,
    cacheTime: 1000 * 60 * 30, // 30 min
  });
  const { t } = useTranslation(['modals', 'common']);
  const tooltipContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setThresholdOptions(Array.from({ length: signers.length - 1 }, (_, i) => i + 1));
  }, [signers]);

  const removeSigner = useRemoveSigner({
    prevSigner: prevSigner,
    signerToRemove: selectedSigner,
    threshold: threshold,
    nonce: nonce,
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
        {t('removeSignerLabel', { ns: 'modals' })}
      </Text>
      <Text
        color="grayscale.600"
        textStyle="text-base-mono-regular"
        bgColor="black.500"
        px={4}
        py={2}
        mt={2}
        rounded="sm"
      >
        {ensName ? ensName : selectedSigner}
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
          {t('updateThreshold', { ns: 'modals' })}
        </Text>
        <Flex ref={tooltipContainer}>
          <ModalTooltip
            containerRef={tooltipContainer}
            label={t('updateSignersTooltip')}
            maxW={TOOLTIP_MAXW}
            placement="top"
          >
            <SupportQuestion
              boxSize="1.5rem"
              minWidth="auto"
              mx="2"
              mt="1"
            />
          </ModalTooltip>
        </Flex>
      </HStack>
      <HStack>
        <Select
          onChange={e => setThreshold(Number(e.target.value))}
          mt={4}
          width="8rem"
          bgColor="#2c2c2c"
          borderColor="#4d4d4d"
          rounded="sm"
          cursor="pointer"
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
          >{`${t('signersRequired1', { ns: 'modals' })} ${signers.length - 1} ${t(
            'signersRequired2',
            { ns: 'modals' }
          )}`}</Text>
        </Flex>
      </HStack>
      <Alert
        status="info"
        w="fit-full"
        mt={6}
      >
        <Image
          src="/images/alert-triangle.svg"
          alt="alert triangle"
          w="1.5rem"
          h="1.5rem"
          ml={3}
          mr={3}
          textColor="blue.500"
        />
        <AlertTitle>
          <Text
            textStyle="text-sm-mono-regular"
            whiteSpace="pre-wrap"
          >
            {t('updateSignerWarning', { ns: 'modals' })}
          </Text>
        </AlertTitle>
      </Alert>
      <Divider
        color="chocolate.700"
        mt={6}
        mb={6}
      />
      <CustomNonceInput
        nonce={nonce}
        onChange={newNonce => setNonce(newNonce ? newNonce : undefined)}
      />
      <Button
        isDisabled={!threshold || !nonce || !safe || nonce < safe.nonce}
        mt={6}
        width="100%"
        onClick={onSubmit}
      >
        {t('createProposal', { ns: 'modals' })}
      </Button>
    </Box>
  );
}

export default RemoveSignerModal;
