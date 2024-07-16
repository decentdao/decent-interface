import { Box, Button, Flex, VStack, Select } from '@chakra-ui/react';
import { CaretDown } from '@phosphor-icons/react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { DAO_ROUTES } from '../../../constants/routes';
import useSubmitProposal from '../../../hooks/DAO/proposal/useSubmitProposal';
import useCreateSablierStream from '../../../hooks/streams/useCreateSablierStream';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { TokenBalance } from '../../../types';
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
  const { addressPrefix } = useNetworkConfig();
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
  const { prepareCreateTranchedLockupProposal } = useCreateSablierStream();

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
    if (startDate && recipient && selectedAsset && frequency && months > 0) {
      const proposalData = prepareCreateTranchedLockupProposal({
        months,
        frequency,
        totalAmount,
        asset: selectedAsset,
        recipient,
        startDate,
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
    frequency,
    months,
    prepareCreateTranchedLockupProposal,
    recipient,
    safe?.nonce,
    selectedAsset,
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
