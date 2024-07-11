import { Box, Button, Flex, VStack, Select } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, encodeFunctionData, erc20Abi, getAddress, zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import SablierBatchAbi from '../../../assets/abi/SablierV2Batch';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { ProposalExecuteData, TokenBalance } from '../../../types';
import { PayrollFrequency } from '../../../types/sablier';
import { InputComponent } from '../forms/InputComponent';
import LabelWrapper from '../forms/LabelWrapper';
import Divider from '../utils/Divider';

export default function PayrollStreamBuilder() {
  const { address: account } = useAccount();
  const {
    node: { daoAddress, safe },
    treasury: { assetsFungible },
  } = useFractal();
  const {
    contracts: { sablierV2Batch, sablierV2LockupDynamic },
    addressPrefix,
  } = useNetworkConfig();
  const [sender, setSender] = useState(daoAddress);
  const [recipient, setRecipient] = useState<Address | undefined>(account);
  const [totalAmount, setTotalAmount] = useState<string>('25000');
  const [startDate, setStartDate] = useState(Math.round(Date.now() / 1000) + 60 * 15); // Unix timestamp. 15 minutes from moment of proposal creation by default for development purposes
  const [frequency, setFrequency] = useState<PayrollFrequency>('monthly');
  const [months, setMonths] = useState(0); // Total number of months
  // @todo - seems like good chunk of this logic can be re-used between payroll/vesting stream building and send assets modal
  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);
  const [selectedAsset, setSelectedAsset] = useState<TokenBalance>(fungibleAssetsWithBalance[0]);
  const selectedAssetIndex = fungibleAssetsWithBalance.findIndex(
    asset => asset.tokenAddress === selectedAsset?.tokenAddress,
  );

  const { submitProposal } = useSubmitProposal();
  const navigate = useNavigate();
  const { t } = useTranslation('proposal');

  const successCallback = useCallback(() => {
    if (daoAddress) {
      navigate(DAO_ROUTES.proposals.relative(addressPrefix, daoAddress));
    }
  }, [addressPrefix, daoAddress, navigate]);

  useEffect(() => {
    if (fungibleAssetsWithBalance.length) {
      setSelectedAsset(fungibleAssetsWithBalance[0]);
    }
  }, [fungibleAssetsWithBalance]);

  const handleSubmitProposal = useCallback(() => {
    if (
      sender &&
      sablierV2Batch &&
      sablierV2LockupDynamic &&
      startDate &&
      recipient &&
      selectedAsset &&
      frequency &&
      months > 0
    ) {
      const tokenAddress = getAddress(selectedAsset.tokenAddress);
      const exponent = 10n ** BigInt(selectedAsset.decimals);
      const totalAmountExponented = BigInt(totalAmount) * exponent;
      let totalSegments = months;
      if (frequency === 'weekly') {
        // @todo - obviously this isn't correct and we need proper calculation of how many weeks are in the amount of months entered
        totalSegments = months * 4;
      } else if (frequency === 'biweekly') {
        // @todo - again, not correct - need to get exact number of 2-weeks cycles from the total number of months
        totalSegments = months * 2;
      }
      const segmentAmount = totalAmountExponented / BigInt(totalSegments);
      const segments: { amount: bigint; exponent: bigint; duration: number }[] = [];

      const SECONDS_IN_DAY = 24 * 60 * 60;
      let days = 30;
      if (frequency === 'weekly') {
        days = 7;
      } else if (frequency === 'biweekly') {
        days = 14;
      }
      const duration = days * SECONDS_IN_DAY;

      for (let i = 1; i <= totalSegments; i++) {

        segments.push({
          amount: segmentAmount,
          exponent,
          duration: i === 1 ? Math.round(startDate - Date.now() / 1000) + duration : duration, // Sablier sets startTime to block.timestamp - so we need to make first segment being streamed longer
        });
      }

      const sablierBatchCalldata = encodeFunctionData({
        abi: SablierBatchAbi,
        functionName: 'createWithDurationsLD', // Another option would be to use createWithTimestampsLD. Essentially they're doing the same
        args: [
          sablierV2LockupDynamic,
          tokenAddress,
          [
            {
              sender, // Tokens sender. This address will be able to cancel the stream
              cancelable: true, // Cancelable - is it possible to cancel this stream
              transferable: false, // Transferable - is Recipient able to transfer receiving rights to someone else
              recipient, // Recipient of tokens through stream
              totalAmount: totalAmountExponented, // total amount of tokens sent
              broker: { account: zeroAddress, fee: 0n }, // Optional broker
              segments, // Segments array of tuples
            },
          ],
        ],
      });

      const tokenCalldata = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [sablierV2Batch, totalAmountExponented],
      });
      const proposalData: ProposalExecuteData = {
        targets: [tokenAddress, sablierV2Batch],
        values: [0n, 0n],
        calldatas: [tokenCalldata, sablierBatchCalldata],
        metaData: {
          title: 'Create Payroll Stream for Role',
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
  }, [
    frequency,
    months,
    recipient,
    sablierV2Batch,
    sablierV2LockupDynamic,
    safe?.nonce,
    selectedAsset,
    sender,
    startDate,
    submitProposal,
    successCallback,
    t,
    totalAmount,
  ]);

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
            label="Total Amount"
            placeholder="25,000"
            value={totalAmount}
            onChange={event => setTotalAmount(event.target.value)}
          />
        </Flex>
        <Box
          width="100%"
          marginEnd="0.75rem"
        >
          <LabelWrapper label="Payroll Asset">
            <Select
              name="payroll-asset"
              bgColor="neutral-1"
              borderColor="neutral-3"
              rounded="sm"
              cursor="pointer"
              iconSize="1.5rem"
              icon={<CaretDown />}
              onChange={e => {
                setSelectedAsset(fungibleAssetsWithBalance[Number(e.target.value)]);
              }}
              value={selectedAssetIndex}
            >
              {fungibleAssetsWithBalance.map((asset, index) => (
                <option
                  key={index}
                  value={index}
                >
                  {asset.symbol}
                </option>
              ))}
            </Select>
          </LabelWrapper>
        </Box>
        <Box width="100">
          <LabelWrapper label="Payroll Frequency">
            <Select
              name="payroll-frequency"
              value={frequency}
              bgColor="neutral-1"
              borderColor="neutral-3"
              rounded="sm"
              cursor="pointer"
              iconSize="1.5rem"
              icon={<CaretDown />}
              onChange={e => setFrequency(e.target.value as PayrollFrequency)}
            >
              <option value="montly">Montly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="weekly">Weekly</option>
            </Select>
          </LabelWrapper>
        </Box>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Payment start (timestamp)"
            placeholder="1702692275"
            value={startDate.toString()}
            onChange={event => setStartDate(parseInt(event.target.value))}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Months"
            placeholder="12"
            value={months.toString()}
            onChange={event => setMonths(parseInt(event.target.value))}
          />
        </Flex>
      </VStack>
      <Divider my="1rem" />
      <Button
        onClick={handleSubmitProposal}
        width="100%"
        disabled={!selectedAsset || !totalAmount || !months}
      >
        Activate Money Rain $$$
      </Button>
    </Box>
  );
}
