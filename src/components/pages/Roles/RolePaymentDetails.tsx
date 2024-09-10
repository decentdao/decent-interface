import { Box, Button, Flex, Grid, GridItem, Icon, IconButton, Image, Text } from '@chakra-ui/react';
import { Calendar, DotsThree, Download, Trash } from '@phosphor-icons/react';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Address, getAddress, Hex } from 'viem';
import { useAccount, usePublicClient } from 'wagmi';
import { NEUTRAL_2_82_TRANSPARENT, CARD_SHADOW } from '../../../constants/common';
import { DAO_ROUTES } from '../../../constants/routes';
import { useFractal } from '../../../providers/App/AppProvider';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { useRolesStore } from '../../../store/roles';
import { BigIntValuePair } from '../../../types';
import { DEFAULT_DATE_FORMAT, formatCoin, formatUSD } from '../../../utils';
import { ModalType } from '../../ui/modals/ModalProvider';
import { useDecentModal } from '../../ui/modals/useDecentModal';

const PAYMENT_DETAILS_BOX_SHADOW =
  '0px 0px 0px 1px #100414, 0px 0px 0px 1px rgba(248, 244, 252, 0.04) inset, 0px 1px 0px 0px rgba(248, 244, 252, 0.04) inset';

function CancelStreamMenu({
  onSuccess,
  // hatId,
  // streamId,
}: {
  hatId: Hex;
  streamId: string;
  onSuccess: () => void;
}) {
  const { t } = useTranslation(['roles']);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCancelPayment = () => {
    setTimeout(() => onSuccess(), 50);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Flex
      justifyContent="flex-end"
      boxShadow={PAYMENT_DETAILS_BOX_SHADOW}
      borderTopRadius="0.5rem"
      w="full"
      py="0.25rem"
      px="1rem"
    >
      <IconButton
        aria-label="edit role menu"
        variant="tertiary"
        h="fit-content"
        size="lg"
        as={DotsThree}
        onClick={() => setShowMenu(show => !show)}
      />
      {showMenu && (
        <Box
          position="absolute"
          ref={menuRef}
          minW="15.25rem"
          top="45%"
          rounded="0.5rem"
          bg={NEUTRAL_2_82_TRANSPARENT}
          border="1px solid"
          borderColor="neutral-3"
          backdropFilter="blur(6px)"
          boxShadow={CARD_SHADOW}
          zIndex={10000}
        >
          <Button
            variant="unstyled"
            color="red-1"
            _hover={{ bg: 'neutral-2' }}
            onClick={handleCancelPayment}
            rightIcon={
              <Icon
                as={Trash}
                boxSize="1.5rem"
              />
            }
            minW="full"
            justifyContent="space-between"
          >
            {t('cancelPayment')}
          </Button>
        </Box>
      )}
    </Flex>
  );
}

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
  roleHatId?: Hex;
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
    isStreaming: () => boolean;
    withdrawableAmount?: bigint;
  };
  onClick?: () => void;
  showWithdraw?: boolean;
  showCancel?: boolean;
}
export function RolePaymentDetails({
  payment,
  onClick,
  showWithdraw,
  roleHatWearerAddress,
  roleHatSmartAddress,
  roleHatId,
  showCancel,
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

  const isActiveStream = !payment.isCancelled && Date.now() < payment.endDate.getTime();

  const activeStreamProps = useCallback(
    (isTop: boolean) =>
      isActiveStream
        ? {
            bg: '#221D25',
            sx: undefined,
            boxShadow: PAYMENT_DETAILS_BOX_SHADOW,
          }
        : {
            sx: {
              p: {
                color: 'neutral-6',
              },
            },
            bg: 'none',
            boxShadow: 'none',
            borderTop: '1px solid',
            borderBottom: isTop ? 'none' : '1px solid',
            borderLeft: '1px solid',
            borderRight: '1px solid',
            borderColor: 'neutral-4',
          },
    [isActiveStream],
  );

  return (
    <Box
      my="0.75rem"
      w="full"
    >
      {showCancel && !!roleHatId && !!payment.streamId && (
        <CancelStreamMenu
          hatId={roleHatId}
          streamId={payment.streamId}
          onSuccess={() => {}}
        />
      )}
      <Box
        borderTopRadius={showCancel ? 'none' : '0.5rem'}
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
              boxShadow={PAYMENT_DETAILS_BOX_SHADOW}
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
              boxShadow={PAYMENT_DETAILS_BOX_SHADOW}
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
  );
}
