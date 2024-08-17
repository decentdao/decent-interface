import { Box, Button, Flex, Grid, GridItem, Icon, Image, Text } from '@chakra-ui/react';
import { Calendar, Download } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getAddress, getContract } from 'viem';
import { useWalletClient } from 'wagmi';
import { SablierV2LockupLinearAbi } from '../../../assets/abi/SablierV2LockupLinear';
import { DETAILS_SHADOW } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { convertStreamIdToBigInt } from '../../../hooks/streams/useCreateSablierStream';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentRoleHat } from '../../../store/roles';
import { DEFAULT_DATE_FORMAT, formatCoin, formatUSD } from '../../../utils';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';
import { RoleValue, SablierPayment } from './types';

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
      border="2px solid"
      borderColor="celery--5"
    />
  );
}

interface RolePaymentDetailsProps {
  roleHat?: DecentRoleHat | RoleValue;
  payment: SablierPayment;
  onClick?: () => void;
  showWithdraw?: boolean;
}
export function RolePaymentDetails({
  payment,
  onClick,
  showWithdraw,
  roleHat,
}: RolePaymentDetailsProps) {
  const { t } = useTranslation(['roles']);
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { data: walletClient } = useWalletClient();
  const { addressPrefix } = useNetworkConfig();
  const navigate = useNavigate();

  const [withdrawableAmount, setWithdrawableAmount] = useState(0n);

  const loadAmounts = useCallback(async () => {
    if (walletClient && payment?.streamId && payment?.contractAddress) {
      const streamContract = getContract({
        abi: SablierV2LockupLinearAbi,
        address: payment.contractAddress,
        client: walletClient,
      });

      const bigintStreamId = convertStreamIdToBigInt(payment.streamId);

      const newWithdrawableAmount = await streamContract.read.withdrawableAmountOf([
        bigintStreamId,
      ]);
      setWithdrawableAmount(newWithdrawableAmount);
    }
  }, [walletClient, payment?.streamId, payment?.contractAddress]);

  useEffect(() => {
    loadAmounts();
  }, [loadAmounts]);

  const withdraw = useDecentModal(ModalType.WITHDRAW_PAYMENT, {
    payment,
    roleHat,
    onSuccess: loadAmounts,
    withdrawableAmount,
  });

  const handleClickWithdraw = useCallback(() => {
    if (safe?.address) {
      navigate(DAO_ROUTES.roles.relative(addressPrefix, safe.address));
      withdraw();
    }
  }, [addressPrefix, navigate, safe?.address, withdraw]);

  const amountPerWeek = useMemo(() => {
    if (!payment.amount?.bigintValue) {
      return;
    }

    const endTime = payment.endDate.getTime() / 1000;
    const startTime = payment.startDate.getTime() / 1000;
    const totalSeconds = endTime - startTime;
    const amountPerSecond = payment.amount.bigintValue / BigInt(totalSeconds);
    const secondsInWeek = BigInt(60 * 60 * 24 * 7);
    return amountPerSecond * secondsInWeek;
  }, [payment]);

  const streamAmountUSD = useMemo(() => {
    if (!payment.amount) {
      return;
    }
    // @todo add price support for tokens not found in assetsFungible
    const foundAsset = assetsFungible.find(
      asset => getAddress(asset.tokenAddress) === payment.asset.address,
    );
    if (!foundAsset || foundAsset.usdPrice === undefined) {
      return;
    }
    return Number(payment.amount.value) * foundAsset.usdPrice;
  }, [payment.amount, payment.asset?.address, assetsFungible]);

  const start =
    payment.cliffDate === undefined && payment.startDate !== undefined
      ? payment.startDate.getTime()
      : payment.cliffDate !== undefined
        ? payment.cliffDate.getTime()
        : undefined;

  const end = payment.endDate ? payment.endDate.getTime() : undefined;
  const now = new Date().getTime();
  const isStreaming = !!start && !!end && start <= now && end > now;
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
              {payment.amount?.bigintValue
                ? formatCoin(
                    payment.amount.bigintValue,
                    false,
                    payment.asset?.decimals,
                    payment.asset?.symbol,
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
                src={payment.asset?.logo}
                fallbackSrc="/images/coin-icon-default.svg"
                boxSize="1.5rem"
              />
              <Text
                textStyle="label-base"
                color="white-0"
              >
                {payment.asset?.symbol ?? t('selectLabel', { ns: 'modals' })}
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
                <GreenStreamingDot isStreaming={isStreaming} />
                <Text
                  textStyle="label-small"
                  color="white-0"
                >
                  {`${formatCoin(amountPerWeek, true, payment.asset?.decimals, payment.asset?.symbol)} / ${t('week')}`}
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
              date={payment.startDate}
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
              date={payment.cliffDate}
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
              date={payment.endDate}
            />
          </GridItem>
        </Grid>
        {!!showWithdraw && withdrawableAmount > 0n && (
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
