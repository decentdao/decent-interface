import { Box, Button, Flex, Grid, GridItem, Icon, Image, Show, Tag, Text } from '@chakra-ui/react';
import { CalendarBlank, Download, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { TouchEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, getAddress } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { DETAILS_BOX_SHADOW } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles/useRolesStore';
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
      <Flex
        gap="0.25rem"
        alignItems="center"
      >
        <Icon
          boxSize="1rem"
          as={CalendarBlank}
          color={date ? 'lilac-0' : 'neutral-6'}
        />
        <Text
          textStyle="label-small"
          color={date ? 'white-0' : 'neutral-6'}
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
  payment: {
    streamId?: string;
    contractAddress?: Address;
    asset: {
      logo: string;
      symbol: string;
      decimals: number;
      address: Address;
    };
    amount: BigIntValuePair;
    startDate: Date;
    endDate: Date;
    cliffDate?: Date;
    isCancelled: boolean;
    isCancelling?: boolean;
    isStreaming: () => boolean;
    isCancellable: () => boolean;
    withdrawableAmount?: bigint;
  };
  onClick?: () => void;
  onCancel?: () => void;
  showWithdraw?: boolean;
  showCancel?: boolean;
}
export function RolePaymentDetails({
  payment,
  onClick,
  showWithdraw,
  roleHatWearerAddress,
  roleHatSmartAddress,
  showCancel,
  onCancel,
}: RolePaymentDetailsProps) {
  const { t } = useTranslation(['roles']);
  const {
    node: { safe },
    treasury: { assetsFungible },
  } = useFractal();
  const { address: connectedAccount } = useAccount();
  const { addressPrefix } = useNetworkConfig();
  const { refreshWithdrawableAmount } = useRolesStore();
  const navigate = useNavigate();
  const publicClient = usePublicClient();
  const canWithdraw = useMemo(() => {
    if (connectedAccount && connectedAccount === roleHatWearerAddress && !!showWithdraw) {
      return true;
    }
    return false;
  }, [connectedAccount, showWithdraw, roleHatWearerAddress]);

  const [modalType, props] = useMemo(() => {
    if (
      !payment.streamId ||
      !payment.contractAddress ||
      !roleHatWearerAddress ||
      !roleHatSmartAddress ||
      !publicClient
    ) {
      return [ModalType.NONE] as const;
    }
    return [
      ModalType.WITHDRAW_PAYMENT,
      {
        paymentAssetLogo: payment.asset.logo,
        paymentAssetSymbol: payment.asset.symbol,
        paymentAssetDecimals: payment.asset.decimals,
        paymentStreamId: payment.streamId,
        paymentContractAddress: payment.contractAddress,
        onSuccess: () =>
          refreshWithdrawableAmount(roleHatSmartAddress, payment.streamId!, publicClient),
        withdrawInformation: {
          withdrawableAmount: payment.withdrawableAmount,
          roleHatWearerAddress,
          roleHatSmartAddress,
        },
      },
    ] as const;
  }, [payment, roleHatSmartAddress, roleHatWearerAddress, refreshWithdrawableAmount, publicClient]);

  const withdraw = useDecentModal(modalType, props);

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
    const totalSeconds = Math.round(endTime - startTime); // @dev due to milliseconds we need to round it to avoid problems with BigInt
    const amountPerSecond = payment.amount.bigintValue / BigInt(totalSeconds);
    const secondsInWeek = BigInt(60 * 60 * 24 * 7);
    return amountPerSecond * secondsInWeek;
  }, [payment]);

  const streamAmountUSD = useMemo(() => {
    // @todo add price support for tokens not found in assetsFungible
    const foundAsset = assetsFungible.find(
      asset => getAddress(asset.tokenAddress) === payment.asset.address,
    );
    if (!foundAsset || foundAsset.usdPrice === undefined) {
      return;
    }
    return Number(payment.amount.value) * foundAsset.usdPrice;
  }, [payment, assetsFungible]);

  const isActiveStream =
    !payment.isCancelled && Date.now() < payment.endDate.getTime() && !payment.isCancelling;

  const activeStreamProps = useCallback(
    (isTop: boolean) =>
      isActiveStream
        ? {
            bg: 'neutral-2',
            sx: undefined,
            boxShadow: DETAILS_BOX_SHADOW,
          }
        : {
            sx: {
              p: {
                color: 'neutral-6',
              },
            },
            bg: 'none',
            boxShadow: 'none',
            border: '1px solid',
            borderBottom: isTop ? 'none' : '1px solid',
            borderColor: 'neutral-4',
          },
    [isActiveStream],
  );

  const [showInlineDelete, setShowInlineDelete] = useState(false);
  const [touchStart, setTouchStart] = useState<number>();
  const [touchEnd, setTouchEnd] = useState<number>();

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 30;

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEnd(undefined); // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isRightSwipe && showInlineDelete) {
      setShowInlineDelete(false);
    } else if (isLeftSwipe && !showInlineDelete) {
      setShowInlineDelete(true);
    }
  };

  const handleConfirmCancelPayment = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const confirmCancelPayment = useDecentModal(ModalType.CONFIRM_CANCEL_PAYMENT, {
    onSubmit: handleConfirmCancelPayment,
  });

  useEffect(() => {
    if (payment.isCancelling && showInlineDelete) {
      setTouchEnd(undefined);
      setTouchStart(undefined);
      setShowInlineDelete(false);
    }
  }, [payment.isCancelling, showInlineDelete]);

  return (
    <Flex
      my="0.75rem"
      w="full"
      onTouchStart={showCancel ? onTouchStart : undefined}
      onTouchMove={showCancel ? onTouchMove : undefined}
      onTouchEnd={showCancel ? onTouchEnd : undefined}
      position="relative"
    >
      <Box
        w={showInlineDelete ? 'calc(100% - 56px)' : 'full'}
        zIndex={2}
        transitionDuration="300ms"
        transitionProperty="all"
        transitionTimingFunction="ease-out"
      >
        <Box
          borderTopRadius="0.5rem"
          py="1rem"
          onClick={onClick}
          cursor={!!onClick ? 'pointer' : 'default'}
          {...activeStreamProps(true)}
        >
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
                      payment.asset.decimals,
                      payment.asset.symbol,
                    )
                  : undefined}
              </Text>
              <Flex
                gap={[2, 2, 6]}
                alignItems="center"
                justifyContent={['flex-end', 'flex-end', 'flex-end', 'unset']}
                flexWrap="wrap"
              >
                {(payment.isCancelled || payment.isCancelling) && (
                  <Tag
                    variant="outlined"
                    color="red-1"
                    outline="unset"
                    border="1px solid"
                    py={0}
                    px={2}
                    height={6}
                    borderRadius="lg"
                  >
                    {t(payment.isCancelling ? 'cancelling' : 'cancelled')}
                  </Tag>
                )}
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
                    src={payment.asset.logo}
                    fallbackSrc="/images/coin-icon-default.svg"
                    boxSize="1.5rem"
                  />
                  <Text
                    textStyle="label-base"
                    color="white-0"
                  >
                    {payment.asset.symbol ?? t('selectLabel', { ns: 'modals' })}
                  </Text>
                </Flex>
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
                  <GreenStreamingDot isStreaming={payment.isStreaming()} />
                  <Text
                    textStyle="label-small"
                    color="white-0"
                  >
                    {`${formatCoin(amountPerWeek, true, payment.asset.decimals, payment.asset.symbol)} / ${t('week')}`}
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Box>

        <Box
          {...activeStreamProps(false)}
          borderBottomRadius="0.5rem"
          py="1rem"
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
                boxShadow={DETAILS_BOX_SHADOW}
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
                boxShadow={DETAILS_BOX_SHADOW}
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
          {canWithdraw && (
            <Box
              mt={4}
              px={4}
            >
              <Button
                w="full"
                isDisabled={!((payment?.withdrawableAmount ?? 0n) > 0n)}
                leftIcon={<Download />}
                onClick={handleClickWithdraw}
              >
                {t('withdraw')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>
      <Show below="md">
        <Button
          backgroundColor="red-0"
          height="100%"
          zIndex={1}
          position="absolute"
          top={0}
          right={showInlineDelete ? '0.5rem' : 0}
          transitionDuration="300ms"
          transitionProperty="all"
          transitionTimingFunction="ease-out"
          width={showInlineDelete ? '56px' : '0px'}
          borderTopRightRadius="0.5rem"
          borderBottomRightRadius="0.5rem"
          boxShadow={DETAILS_BOX_SHADOW}
          overflow="hidden"
          alignItems="center"
          justifyContent="center"
          py="1rem"
          opacity={showInlineDelete ? '1' : '0'}
          variant="unstyled"
          onClick={confirmCancelPayment}
        >
          <Trash size="24" />
        </Button>
      </Show>
    </Flex>
  );
}
