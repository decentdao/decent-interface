import { Box, Button, Flex, VStack, Divider } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData, erc20Abi } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { useAccount } from 'wagmi';
import SablierBatchABI from '../../../assets/abi/SablierV2Batch.json';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData } from '../../../types';
import { InputComponent, TextareaComponent } from '../forms/InputComponent';

type SablierStreamSegment = [number | string, number | string, number];

export default function CreateSablierProposalModal({ close }: { close: () => void }) {
  const { address: account } = useAccount();
  const {
    node: { daoAddress, safe },
    governanceContracts: { votesTokenContractAddress },
  } = useFractal();
  const { chainId } = useNetworkConfig();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [sender, setSender] = useState<Address | null>(daoAddress as Address);
  const [recipient, setRecipient] = useState<Address | undefined>(account);
  const [totalAmount, setTotalAmount] = useState<string>('25000000000000000000000'); // 25,000
  const [tokenAddress, setTokenAddress] = useState<Address | undefined>(
    votesTokenContractAddress as Address,
  );
  const [startDate, setStartDate] = useState(Math.round(Date.now() / 1000) + 60 * 15); // Unix timestamp. 15 minutes from moment of proposal creation by default
  //   const [segments, setSegments] = useState<SablierStreamSegment[]>([]);

  const { submitProposal } = useSubmitProposal();
  const navigate = useNavigate();
  const { t } = useTranslation('proposal');

  const successCallback = () => {
    if (daoAddress) {
      close();
      navigate(DAO_ROUTES.proposals.relative(daoAddress));
    }
  };

  const handleSubmitProposal = () => {
    const functionName = 'createWithMilestones';
    let sablierBatchAddress: Address | undefined = undefined;
    let sablierLockupDynamicAddress: Address | undefined = undefined;
    let hardCodedSegments: SablierStreamSegment[] = [];

    if (chainId === sepolia.id) {
      sablierBatchAddress = '0xd2569DC4A58dfE85d807Dffb976dbC0a3bf0B0Fb'; // SablierV2Batch on Sepolia
      sablierLockupDynamicAddress = '0xc9940AD8F43aAD8e8f33A4D5dbBf0a8F7FF4429A'; // SablierV2LockupDynamic on Sepolia
      hardCodedSegments = [
        [0, '1000000000000000000', startDate + 60 * 10], // First number represents amount of tokens denoted in units of token's decimals. Second number represents exponent, denoted as a fixed-point number. Third value is a Unix timestamp till when amount set in first value will be fully streamed
        [totalAmount, '1000000000000000000', startDate + 60 * 15], // For testing purpose - make the whole amount streamed at the start date + 15 minutes
      ]; // Array of segments, see explanation above. Additional explanation: https://github.com/sablier-labs/v2-core/blob/main/src/types/DataTypes.sol#L131-L140
    } else if (chainId === mainnet.id) {
      sablierBatchAddress = '0xEa07DdBBeA804E7fe66b958329F8Fa5cDA95Bd55'; // SablierV2Batch on Mainnet
      sablierLockupDynamicAddress = '0x7CC7e125d83A581ff438608490Cc0f7bDff79127'; // SablierV2LockupDynamic on Mainnet
      const segmentAmount = BigNumber.from(totalAmount).div(5).toNumber();
      hardCodedSegments = [
        [0, '1000000000000000000', 1714572239],
        [segmentAmount, '1000000000000000000', 1714572240],
        [0, '1000000000000000000', 1717250639],
        [segmentAmount, '1000000000000000000', 1717250640],
        [0, '1000000000000000000', 1719842639],
        [segmentAmount, '1000000000000000000', 1719842640],
        [0, '1000000000000000000', 1722521039],
        [segmentAmount, '1000000000000000000', 1722521040],
        [0, '1000000000000000000', 1725199439],
        [segmentAmount, '1000000000000000000', 1725199440],
      ];
    }

    if (
      sablierLockupDynamicAddress &&
      sablierBatchAddress &&
      tokenAddress &&
      startDate &&
      recipient &&
      hardCodedSegments.length > 0
    ) {
      const sablierBatchData = [
        sablierLockupDynamicAddress,
        tokenAddress,
        [
          [
            sender, // Tokens sender. This address will be able to cancel the stream
            startDate, // Start time
            true, // Cancelable - is it possible to cancel this stream
            false, // Transferable - is Recipient able to transfer receiving rights to someone else
            recipient, // Recipient of tokens through stream
            totalAmount, // total amount of tokens sent
            ['0x0000000000000000000000000000000000000000', 0], // Optional broker
            hardCodedSegments, // Segments array of tuples
          ],
        ],
      ];

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierBatchABI,
        functionName,
        args: sablierBatchData,
      });
      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierBatchAddress, BigInt(totalAmount)],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierBatchAddress],
        values: [0, 0],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title,
          description,
          documentationUrl,
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
      <VStack
        align="left"
        spacing={4}
        mt={4}
      >
        <InputComponent
          label={t('proposalTitle')}
          helper={t('proposalTitleHelper')}
          isRequired={false}
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={false}
          placeholder={t('proposalTitlePlaceholder')}
          testId="metadata.title"
        />
        <TextareaComponent
          label={t('proposalDescription')}
          helper={t('proposalDescriptionHelper')}
          isRequired={false}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={false}
          placeholder={t('proposalDescriptionPlaceholder')}
          rows={9}
        />
        <InputComponent
          label={t('proposalAdditionalResources')}
          helper={t('proposalAdditionalResourcesHelper')}
          isRequired={false}
          onChange={e => setDocumentationUrl(e.target.value)}
          value={documentationUrl}
          disabled={false}
          placeholder={t('proposalAdditionalResourcesPlaceholder')}
          testId="metadata.documentationUrl"
        />
      </VStack>
      <Divider
        color="chocolate.700"
        mt={8}
        mb={6}
      />
      <VStack>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label={t('sablierStreamSenderLabel')}
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
            label={t('sablierStreamRecipientLabel')}
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
            label={t('sablierStreamTotalAmountLabel')}
            placeholder="25000000000000000000000"
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
            label={t('sablierStreamTokenAddressLabel')}
            placeholder="0x77b1489813c46f8af1006e0f034a4534b9c82e6c"
            value={tokenAddress || ''}
            onChange={event => setTokenAddress(event.target.value as Address)}
          />
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
        color="chocolate.700"
        mt={8}
        mb={6}
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
