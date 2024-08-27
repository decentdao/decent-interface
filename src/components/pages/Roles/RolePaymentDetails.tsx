import { Box, Button, Flex, Grid, GridItem, Icon, Image, Text } from '@chakra-ui/react';
import { Calendar, Download } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, getAddress, getContract } from 'viem';
import { useWalletClient, useAccount } from 'wagmi';
import { SablierV2LockupLinearAbi } from '../../../assets/abi/SablierV2LockupLinear';
import { DETAILS_SHADOW } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { convertStreamIdToBigInt } from '../../../hooks/streams/useCreateSablierStream';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { BigIntValuePair } from '../../../types';
import { DEFAULT_DATE_FORMAT, formatCoin, formatUSD } from '../../../utils';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';

function PaymentDate({ label, date }: { label: string; date?: Date }) {
  const { t } = useTranslation(['roles']);
  return (
    <Flex
      flexDir="column"
      gap="0.5rem"
    >
      <Text
        textStyle="label-small"
        color="neutral-7"
      >
        {t(label)}
      </Text>
      <Flex gap="0.25rem">
        <Icon
          boxSize="1rem"
          as={Calendar}
        />
        <Text
          textStyle="label-small"
          color="neutral-7"
        >
          {date ? format(date, DEFAULT_DATE_FORMAT) : '---'}
        </Text>
      </Flex>
    </Flex>
  );
}

function GreenStreamingDot({ isStreaming }: { isStreaming: boolean }) {
  if (!isStreaming) {
    return null;
  }
  return (
    <Box
      boxSize="0.75rem"
      borderRadius="100%"
      bg="celery--2"
      border="1px solid"
      borderColor="celery--5"
    />
  );
}

interface RolePaymentDetailsProps {
  roleHatWearerAddress?: Address;
  roleHatSmartAddress?: Address;
  paymentStreamId?: string;
  paymentContractAddress?: Address;
  paymentAsset: {
    logo: string;
    symbol: string;
    decimals: number;
    address: Address;
  };
  paymentAmount: BigIntValuePair;
  paymentStartDate: Date;
  paymentEndDate: Date;
  paymentCliffDate?: Date;
  isStreaming: () => boolean;
  onClick?: () => void;
  showWithdraw?: boolean;
}
export function RolePaymentDetails({
  paymentStreamId,
  paymentContractAddress,
  paymentAsset,
  paymentAmount,
  paymentStartDate,
  paymentEndDate,
  paymentCliffDate,
  isStreaming,
  onClick,
  showWithdraw,
  roleHatWearerAddress,
  roleHatSmartAddress,
}: RolePaymentDetailsProps) {
  const { t } = useTranslation(['roles']);
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { address: connectedAccount } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();

  const [withdrawableAmount, setWithdrawableAmount] = useState(0n);

  const canWithdraw = useMemo(() => {
    if (connectedAccount && connectedAccount === roleHatWearerAddress && !!showWithdraw) {
      return true;
    }
    return false;
  }, [connectedAccount, showWithdraw, roleHatWearerAddress]);

  const loadAmounts = useCallback(async () => {
    if (walletClient && paymentStreamId && paymentContractAddress && canWithdraw) {
      const streamContract = getContract({
        abi: SablierV2LockupLinearAbi,
        address: paymentContractAddress,
        client: walletClient,
      });

      const bigintStreamId = convertStreamIdToBigInt(paymentStreamId);

      const newWithdrawableAmount = await streamContract.read.withdrawableAmountOf([
        bigintStreamId,
      ]);
      setWithdrawableAmount(newWithdrawableAmount);
    }
  }, [walletClient, paymentStreamId, paymentContractAddress, canWithdraw]);

  useEffect(() => {
    loadAmounts();
  }, [loadAmounts]);

  const [modalType, props] = useMemo(() => {
    if (
      !paymentStreamId ||
      !paymentContractAddress ||
      !roleHatWearerAddress ||
      !roleHatSmartAddress
    ) {
      return [ModalType.NONE] as const;
    }
    return [
      ModalType.WITHDRAW_PAYMENT,
      {
        paymentAssetLogo: paymentAsset.logo,
        paymentAssetSymbol: paymentAsset.symbol,
        paymentAssetDecimals: paymentAsset.decimals,
        paymentStreamId: paymentStreamId,
        paymentContractAddress: paymentContractAddress,
        onSuccess: loadAmounts,
        withdrawInformation: {
          withdrawableAmount,
          roleHatWearerAddress,
          roleHatSmartAddress,
        },
      },
    ] as const;
  }, [
    paymentAsset,
    paymentContractAddress,
    paymentStreamId,
    roleHatSmartAddress,
    roleHatWearerAddress,
    loadAmounts,
    withdrawableAmount,
  ]);

  const withdraw = useDecentModal(modalType, props);

  const handleClickWithdraw = useCallback(() => {
    if (safe?.address) {
      navigate(DAO_ROUTES.roles.relative(addressPrefix, safe.address));
      withdraw();
    }
  }, [addressPrefix, navigate, safe?.address, withdraw]);

  const amountPerWeek = useMemo(() => {
    if (!paymentAmount?.bigintValue) {
      return;
    }

    const endTime = paymentEndDate.getTime() / 1000;
    const startTime = paymentStartDate.getTime() / 1000;
    const totalSeconds = Math.round(endTime - startTime); // @dev due to milliseconds we need to round it to avoid problems with BigInt
    const amountPerSecond = paymentAmount.bigintValue / BigInt(totalSeconds);
    const secondsInWeek = BigInt(60 * 60 * 24 * 7);
    return amountPerSecond * secondsInWeek;
  }, [paymentAmount, paymentStartDate, paymentEndDate]);

  const streamAmountUSD = useMemo(() => {
    // @todo add price support for tokens not found in assetsFungible
    const foundAsset = assetsFungible.find(
      asset => getAddress(asset.tokenAddress) === paymentAsset.address,
    );
    if (!foundAsset || foundAsset.usdPrice === undefined) {
      return;
    }
    return Number(paymentAmount.value) * foundAsset.usdPrice;
  }, [paymentAmount, paymentAsset, assetsFungible]);

  return (
    <Box
      boxShadow={DETAILS_SHADOW}
      bg="neutral-2"
      borderRadius="0.5rem"
      pt="1rem"
      my="0.5rem"
      w="full"
      onClick={onClick}
      cursor={!!onClick ? 'pointer' : 'default'}
    >
      <Box>
        <Flex
          flexDir="column"
          mx={4}
        >
          <Flex justifyContent="space-between">
            <Text
              textStyle="display-2xl"
              color="white-0"
            >
              {paymentAmount?.bigintValue
                ? formatCoin(
                    paymentAmount.bigintValue,
                    false,
                    paymentAsset.decimals,
                    paymentAsset.symbol,
                  )
                : undefined}
            </Text>
            <Flex
              gap={2}
              alignItems="center"
              border="1px solid"
              borderColor="neutral-4"
              borderRadius="9999px"
              w="fit-content"
              className="payment-menu-asset"
              p="0.5rem"
            >
              <Image
                src={paymentAsset.logo}
                fallbackSrc="/images/coin-icon-default.svg"
                boxSize="1.5rem"
              />
              <Text
                textStyle="label-base"
                color="white-0"
              >
                {paymentAsset.symbol ?? t('selectLabel', { ns: 'modals' })}
              </Text>
            </Flex>
          </Flex>
          <Flex justifyContent="space-between">
            <Text
              textStyle="label-small"
              color="neutral-7"
            >
              {streamAmountUSD !== undefined ? formatUSD(streamAmountUSD.toString()) : '$ ---'}
            </Text>
            {amountPerWeek !== undefined && (
              <Flex
                alignItems="center"
                gap="0.5rem"
              >
                <GreenStreamingDot isStreaming={isStreaming()} />
                <Text
                  textStyle="label-small"
                  color="white-0"
                >
                  {`${formatCoin(amountPerWeek, true, paymentAsset.decimals, paymentAsset.symbol)} / ${t('week')}`}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </Box>

      <Box
        boxShadow={DETAILS_SHADOW}
        borderBottomRadius="0.5rem"
        py="1rem"
        mt="1rem"
      >
        <Grid
          mx={4}
          templateAreas='"starting dividerOne cliff dividerTwo ending"'
          templateColumns="1fr 24px 1fr 24px 1fr"
        >
          <GridItem area="starting">
            <PaymentDate
              label="starting"
              date={paymentStartDate}
            />
          </GridItem>
          <GridItem area="dividerOne">
            <Box
              borderLeft="1px solid"
              borderColor="white-alpha-08"
              h="full"
              boxShadow={DETAILS_SHADOW}
              w="0"
            />
          </GridItem>
          <GridItem area="cliff">
            <PaymentDate
              label="cliff"
              date={paymentCliffDate}
            />
          </GridItem>
          <GridItem area="dividerTwo">
            <Box
              borderLeft="1px solid"
              borderColor="white-alpha-08"
              h="full"
              boxShadow={DETAILS_SHADOW}
              w="0"
            />
          </GridItem>
          <GridItem area="ending">
            <PaymentDate
              label="ending"
              date={paymentEndDate}
            />
          </GridItem>
        </Grid>
        {canWithdraw && withdrawableAmount > 0n && (
          <Box
            mt={4}
            px={4}
          >
            <Button
              w="full"
              leftIcon={<Download />}
              onClick={handleClickWithdraw}
            >
              {t('withdraw')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
