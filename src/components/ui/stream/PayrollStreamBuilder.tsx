import { Box, Button, Flex, VStack, Text } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData, erc20Abi, getContract, isAddress, zeroAddress } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import SablierBatchAbi from '../../../assets/abi/SablierV2Batch';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import { PayrollFrequency } from '../../../types/sablier';
import { InputComponent } from '../forms/InputComponent';
import Divider from '../utils/Divider';

export default function PayrollStreamBuilder() {
  const { address: account } = useAccount();
  const {
    node: { daoAddress, safe },
    governanceContracts: { votesTokenContractAddress },
  } = useFractal();
  const {
    contracts: { sablierV2Batch, sablierV2LockupDynamic },
    addressPrefix,
  } = useNetworkConfig();
  const [sender, setSender] = useState(daoAddress);
  const [recipient, setRecipient] = useState<Address | undefined>(account);
  const [totalAmount, setTotalAmount] = useState<string>('25000');
  // @dev this token address should be grabbed from treasury, but for testing purposes - that's just an input where you can put any address
  const [tokenAddress, setTokenAddress] = useState<Address | undefined>(
    votesTokenContractAddress as Address,
  );
  const [tokenName, setTokenName] = useState<string>();
  const [tokenSymbol, setTokenSymbol] = useState<string>();
  const [tokenDecimals, setTokenDecimals] = useState<number>();
  const [startDate, setStartDate] = useState(Math.round(Date.now() / 1000) + 60 * 15); // Unix timestamp. 15 minutes from moment of proposal creation by default
  const [frequency, setFrequency] = useState<PayrollFrequency>();
  const [totalSegments, setTotalSegments] = useState(0);

  const publicClient = usePublicClient();

  const { submitProposal } = useSubmitProposal();
  const navigate = useNavigate();
  const { t } = useTranslation('proposal');

  useEffect(() => {
    async function loadTokenDetails() {
      if (publicClient && tokenAddress && isAddress(tokenAddress)) {
        const tokenContract = getContract({
          abi: erc20Abi,
          address: tokenAddress,
          client: publicClient,
        });
        const [name, symbol, decimals] = await Promise.all([
          tokenContract.read.name(),
          tokenContract.read.symbol(),
          tokenContract.read.decimals(),
        ]);
        setTokenName(name);
        setTokenSymbol(symbol);
        setTokenDecimals(decimals);
      }
    }
    loadTokenDetails();
  }, [publicClient, tokenAddress]);
  const successCallback = () => {
    if (daoAddress) {
      close();
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  };

  const handleSubmitProposal = () => {

    if (
      sender &&
      sablierV2Batch &&
      sablierV2LockupDynamic &&
      tokenAddress &&
      startDate &&
      recipient &&
      tokenDecimals &&
      totalSegments > 0
    ) {
      const exponent = 10n ** BigInt(tokenDecimals)
      const segmentAmount = BigInt(totalAmount) * exponent / BigInt(totalSegments);
      const segments: { amount: bigint; exponent: bigint; milestone: number}[] = [];
      for (let i = 0; i <= totalSegments; i++) {
        const milestone = startDate + 3600 * 24 * i;
        if (i === 0) {
          segments.push({ amount: 0n, exponent, milestone: startDate - 1 })
        } else if (i % 2 === 1) {
          segments.push({ amount: segmentAmount, exponent, milestone })
        } else {
          segments.push({ amount: 0n, exponent, milestone: milestone - 1 })
        }
      }
      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierBatchAbi,
        functionName: 'createWithMilestones',
        args: [
          sablierV2LockupDynamic,
          tokenAddress,
          [
            {
              sender, // Tokens sender. This address will be able to cancel the stream
              startTime: startDate,
              cancelable: true, // Cancelable - is it possible to cancel this stream
              transferable: false, // Transferable - is Recipient able to transfer receiving rights to someone else
              recipient, // Recipient of tokens through stream
              totalAmount: BigInt(totalAmount), // total amount of tokens sent
              broker: { account: zeroAddress, fee: 0n }, // Optional broker
              segments, // Segments array of tuples
            },
          ],
        ],
      });
      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, BigInt(totalAmount)],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierV2Batch],
        values: [0n, 0n],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: 'Create Payroll Stream for Hat',
          description: `This madafaking rocket science proposal will create AI Blockchain Crypto Currency Bitcoin BUIDL HODL Sablier V2 Stream of $$$ flowing to ${recipient}`,
          documentationUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      };
      submitProposal({
        nonce: safe?.nonce,
        pendingToastMessage: t('proposalCreatePendingToastMessage'),
        successToastMessage: t('proposalCreateSuccessToastMessage'),
        failedToastMessage: t('proposalCreateFailureToastMessage'),
        successCallback,
        proposalData,
      });
    }
  };

  const inputBasicProps = {
    testId: '',
    isRequired: true,
    inputContainerProps: {
      width: '100%',
    },
    gridContainerProps: {
      width: '100%',
      display: 'flex',
      flexWrap: 'wrap' as const,
    },
  };

  return (
    <Box>
      <VStack>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Stream Sender"
            placeholder="0xD26c85D435F02DaB8B220cd4D2d398f6f646e235"
            value={sender || ''}
            onChange={event => setSender(event.target.value as Address)}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Stream Recipient"
            placeholder="0xD26c85D435F02DaB8B220cd4D2d398f6f646e235"
            value={recipient || ''}
            onChange={event => setRecipient(event.target.value as Address)}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Amount"
            placeholder="25,000"
            value={totalAmount}
            onChange={event => setTotalAmount(event.target.value as Address)}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Token Address"
            placeholder="0x77b1489813c46f8af1006e0f034a4534b9c82e6c"
            value={tokenAddress || ''}
            onChange={event => setTokenAddress(event.target.value as Address)}
          />
          <Text></Text>
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label={t('sablierStreamStartDateLabel')}
            placeholder="1702692275"
            value={startDate.toString()}
            onChange={event => setStartDate(parseInt(event.target.value))}
          />
        </Flex>
      </VStack>
      <Divider
        my="1rem"
      />
      <Button
        onClick={handleSubmitProposal}
        width="100%"
      >
        {t('submitSablierProposal')}
      </Button>
    </Box>
  );
}
