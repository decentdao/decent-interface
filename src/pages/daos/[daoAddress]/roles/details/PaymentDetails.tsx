import {
  Flex,
  Text,
  Box,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Grid,
  Button,
} from '@chakra-ui/react';
import { CaretRight, CaretDown, Download } from '@phosphor-icons/react';
import { ReactNode, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Address, encodeFunctionData, getContract, Hex, getAddress, formatUnits } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import HatsAccount1ofNAbi from '../../../../../assets/abi/HatsAccount1ofN';
import { SablierV2LockupLinearAbi } from '../../../../../assets/abi/SablierV2LockupLinear';
import { SablierPayment } from '../../../../../components/pages/Roles/types';
import { BigIntInput } from '../../../../../components/ui/forms/BigIntInput';
import { convertStreamIdToBigInt } from '../../../../../hooks/streams/useCreateSablierStream';
import { BigIntValuePair } from '../../../../../types';

type AccordionItemRowProps = {
  title: string;
  value?: string;
  children?: ReactNode;
};

function AccordionItemRow({ title, value, children }: AccordionItemRowProps) {
  return (
    <Grid
      gap="0.5rem"
      my="0.5rem"
    >
      <Text
        color="neutral-7"
        textStyle="button-small"
      >
        {title}
      </Text>
      {children ?? <Text textStyle="body-base">{value}</Text>}
    </Grid>
  );
}

export default function PaymentDetails({
  payment,
  roleHat,
}: {
  payment?: SablierPayment;
  roleHat: {
    id: Hex;
    name: string;
    wearer: string;
    description: string;
    smartAddress: Address;
  };
}) {
  const { address: account } = useAccount();
  const { t } = useTranslation(['roles', 'common']);
  const [remainingAmount, setRemainingAmount] = useState('0');
  const [withdrawableAmount, setWithdrawableAmount] = useState(0n);
  const [withdrawAmount, setWithdrawAmount] = useState<BigIntValuePair>({
    value: '0',
    bigintValue: 0n,
  });
  const [withdrawMax, setWithdrawMax] = useState(false);

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const loadAmounts = useCallback(async () => {
    if (walletClient && payment?.streamId && payment?.contractAddress) {
      const streamContract = getContract({
        abi: SablierV2LockupLinearAbi,
        address: payment.contractAddress,
        client: walletClient,
      });

      const bigintStreamId = convertStreamIdToBigInt(payment.streamId);

      const [newWithdrawableAmount, withdrawnAmount] = await Promise.all([
        streamContract.read.withdrawableAmountOf([bigintStreamId]),
        streamContract.read.getWithdrawnAmount([bigintStreamId]),
      ]);

      const newRemainingAmount = BigInt(payment.amount.bigintValue || 0n) - withdrawnAmount;
      setWithdrawableAmount(newWithdrawableAmount);
      setRemainingAmount(formatUnits(newRemainingAmount, payment.asset.decimals));
    }
  }, [
    walletClient,
    payment?.streamId,
    payment?.contractAddress,
    payment?.amount.bigintValue,
    payment?.asset.decimals,
  ]);

  useEffect(() => {
    loadAmounts();
  }, [loadAmounts]);

  useEffect(() => {
    if (payment?.asset?.decimals) {
      if (withdrawAmount.bigintValue === withdrawableAmount) {
        setWithdrawMax(true);
      } else {
        setWithdrawMax(false);
      }
    }
  }, [payment?.asset.decimals, withdrawAmount.bigintValue, withdrawableAmount]);

  const handleWithdraw = useCallback(async () => {
    if (
      payment?.contractAddress &&
      payment?.streamId &&
      walletClient &&
      publicClient &&
      withdrawAmount.bigintValue
    ) {
      try {
        const hatsAccountContract = getContract({
          abi: HatsAccount1ofNAbi,
          address: roleHat.smartAddress,
          client: walletClient,
        });
        const bigIntStreamId = convertStreamIdToBigInt(payment.streamId);
        let hatsAccountCalldata: Hex;
        if (withdrawMax) {
          hatsAccountCalldata = encodeFunctionData({
            abi: SablierV2LockupLinearAbi,
            functionName: 'withdrawMax',
            args: [bigIntStreamId, getAddress(roleHat.wearer)],
          });
        } else {
          hatsAccountCalldata = encodeFunctionData({
            abi: SablierV2LockupLinearAbi,
            functionName: 'withdraw',
            args: [bigIntStreamId, getAddress(roleHat.wearer), withdrawAmount.bigintValue],
          });
        }
        // @todo - Add proper copy
        const withdrawToast = toast('Withdrawing your payment, hang tight', {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          closeButton: false,
          progress: 1,
        });
        const txHash = await hatsAccountContract.write.execute([
          payment.contractAddress,
          0n,
          hatsAccountCalldata,
          0,
        ]);
        const transaction = await publicClient.waitForTransactionReceipt({ hash: txHash });
        toast.dismiss(withdrawToast);
        if (transaction.status === 'success') {
          await loadAmounts();
          toast('Payment successfully withdrawn. Check your wallet :)'); // @todo - Add proper copy
          setWithdrawAmount({
            value: '0',
            bigintValue: 0n,
          });
        } else {
          toast('Transaction for withdrawing your payment reverted :('); // @todo - Add proper copy
        }
      } catch (e) {
        console.error('Error withdrawing from stream', e);
        toast('Transaction for withdrawing your payment failed :('); // @todo - Add proper copy
      }
    }
  }, [
    payment?.contractAddress,
    payment?.streamId,
    publicClient,
    walletClient,
    withdrawAmount.bigintValue,
    roleHat.smartAddress,
    roleHat.wearer,
    withdrawMax,
    loadAmounts,
  ]);

  if (!payment) {
    return null;
  }

  return (
    <Accordion allowMultiple>
      <AccordionItem
        borderTop="none"
        borderBottom="none"
        padding="1rem"
        bg="neutral-3"
        borderRadius="0.5rem"
        mt="0.5rem"
      >
        {({ isExpanded }) => {
          return (
            <>
              <AccordionButton
                p={0}
                textStyle="display-lg"
                color="lilac-0"
                gap="0.5rem"
              >
                {isExpanded ? <CaretDown /> : <CaretRight />}
                {t('payment')}
              </AccordionButton>
              <AccordionPanel>
                <AccordionItemRow title={t('amount')}>
                  <Flex
                    gap="0.75rem"
                    alignItems="center"
                  >
                    <Image
                      src={payment.asset.logo}
                      fallbackSrc="/images/coin-icon-default.svg"
                      alt={payment.asset.symbol}
                      w="2rem"
                      h="2rem"
                    />
                    <Box>
                      <Text textStyle="body-base">
                        {payment.amount.value} {payment.asset.symbol}
                      </Text>
                      <Text
                        color="neutral-7"
                        textStyle="button-small"
                      >
                        {payment.amount.value}
                      </Text>
                    </Box>
                  </Flex>
                </AccordionItemRow>
                <AccordionItemRow
                  title={t('starting')}
                  value={payment.scheduleFixedDate?.startDate?.toDateString()}
                />
                <AccordionItemRow
                  title={t('ending')}
                  value={payment.scheduleFixedDate?.endDate?.toDateString()}
                />
                {account?.toLowerCase() === roleHat.wearer.toLowerCase() && (
                  <Flex
                    bg="white-alpha-04"
                    borderRadius="0.5rem"
                    padding="1rem"
                    gap="1rem"
                    flexWrap="wrap"
                  >
                    <Box w="full">
                      <Text
                        textStyle="body-base"
                        color="white-0"
                      >
                        {t('withdraw')}
                      </Text>
                      <Text
                        textStyle="body-base"
                        color="neutral-7"
                      >
                        {t('withdrawHelper')}
                      </Text>
                    </Box>
                    <Box w="full">
                      <Flex justifyContent="space-between">
                        <Text
                          textStyle="label-base"
                          color="neutral-7"
                        >
                          {t('remaining')}
                        </Text>
                        <Flex alignItems="center">
                          <Image
                            src={payment.asset.logo}
                            fallbackSrc="/images/coin-icon-default.svg"
                            alt={payment.asset.symbol}
                            w="1rem"
                            h="1rem"
                          />
                          <Text
                            textStyle="body-base"
                            color="white-0"
                          >
                            {remainingAmount} {payment.asset.symbol}
                          </Text>
                        </Flex>
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Text
                          textStyle="label-base"
                          color="neutral-7"
                        >
                          {t('withdrawable')}
                        </Text>
                        <Flex alignItems="center">
                          <Image
                            src={payment.asset.logo}
                            fallbackSrc="/images/coin-icon-default.svg"
                            alt={payment.asset.symbol}
                            w="1rem"
                            h="1rem"
                          />
                          <Text
                            textStyle="body-base"
                            color="white-0"
                          >
                            {formatUnits(withdrawableAmount, payment.asset.decimals)}{' '}
                            {payment.asset.symbol}
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                    {withdrawableAmount > 0n && (
                      <>
                        <BigIntInput
                          value={withdrawAmount.bigintValue}
                          onChange={valuePair => setWithdrawAmount(valuePair)}
                          decimalPlaces={payment.asset.decimals}
                          maxValue={withdrawableAmount}
                          data-testid="withdraw-stream-amount-input"
                        />
                        <Flex
                          justifyContent="flex-end"
                          w="full"
                        >
                          <Button
                            leftIcon={<Download />}
                            onClick={handleWithdraw}
                          >
                            {t('withdraw')}
                          </Button>
                        </Flex>
                      </>
                    )}
                  </Flex>
                )}
              </AccordionPanel>
            </>
          );
        }}
      </AccordionItem>
    </Accordion>
  );
}
