import { Box, Button, Flex, VStack, Select, Text } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import useCreateSablierStream from '../../../hooks/streams/useSablierStream';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance } from '../../../types';
import { InputComponent } from '../forms/InputComponent';
import LabelWrapper from '../forms/LabelWrapper';
import Divider from '../utils/Divider';

export default function VestingStreamBuilder() {
  const { address: account } = useAccount();
  const {
    node: { daoAddress, safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { addressPrefix } = useNetworkConfig();
  const [recipient, setRecipient] = useState<Address | undefined>(account);
  const [totalAmount, setTotalAmount] = useState<string>('25000');
  const [streamYears, setStreamYears] = useState(0); // How many years stream should be going
  const [streamDays, setStreamDays] = useState(0);
  const [streamHours, setStreamHours] = useState(0);

  const [cliffYears, setCliffYears] = useState(0);
  const [cliffDays, setCliffDays] = useState(0);
  const [cliffHours, setCliffHours] = useState(0);

  // @todo - seems like good chunk of this logic can be re-used between payroll/vesting stream building and send assets modal
  const fungibleAssetsWithBalance = assetsFungible.filter(asset => parseFloat(asset.balance) > 0);
  const [selectedAsset, setSelectedAsset] = useState<TokenBalance>(fungibleAssetsWithBalance[0]);
  const selectedAssetIndex = fungibleAssetsWithBalance.findIndex(
    asset => asset.tokenAddress === selectedAsset?.tokenAddress,
  );
  const { prepareCreateLinearLockupProposal } = useCreateSablierStream();

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
    if (recipient && selectedAsset) {
      const proposalData = prepareCreateLinearLockupProposal({
        totalAmount,
        asset: selectedAsset,
        recipient,
        schedule: {
          years: streamYears,
          days: streamDays,
          hours: streamHours,
        },
        cliff: {
          years: cliffYears,
          days: cliffDays,
          hours: cliffHours,
        },
      });
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
    cliffDays,
    cliffHours,
    cliffYears,
    prepareCreateLinearLockupProposal,
    recipient,
    safe?.nonce,
    selectedAsset,
    streamDays,
    streamHours,
    streamYears,
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
        <Divider
          variant="darker"
          my="1rem"
        />
        <Flex width="100%">
          <Text>Vesting Schedule Duration</Text>
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Years"
            placeholder="0"
            value={streamYears.toString()}
            onChange={event => setStreamYears(parseInt(event.target.value))}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Days"
            placeholder="0"
            value={streamDays.toString()}
            onChange={event => setStreamDays(parseInt(event.target.value))}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Hours"
            placeholder="0"
            value={streamHours.toString()}
            onChange={event => setStreamHours(parseInt(event.target.value))}
          />
        </Flex>
        <Divider
          variant="darker"
          my="1rem"
        />
        <Flex width="100%">
          <Text>Vesting Cliff Duration</Text>
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Years"
            placeholder="0"
            value={cliffYears.toString()}
            onChange={event => setCliffYears(parseInt(event.target.value))}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Days"
            placeholder="0"
            value={cliffDays.toString()}
            onChange={event => setCliffDays(parseInt(event.target.value))}
          />
        </Flex>
        <Flex
          width="100%"
          flexWrap="wrap"
          marginTop="1.5rem"
        >
          <InputComponent
            {...inputBasicProps}
            label="Hours"
            placeholder="0"
            value={cliffHours.toString()}
            onChange={event => setCliffHours(parseInt(event.target.value))}
          />
        </Flex>
      </VStack>
      <Divider my="1rem" />
      <Button
        onClick={handleSubmitProposal}
        width="100%"
        disabled={!selectedAsset || !totalAmount || !recipient}
      >
        Activate Vesting $$$
      </Button>
    </Box>
  );
}
