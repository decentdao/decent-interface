import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Grid,
  Image,
  Text,
} from '@chakra-ui/react';
import { CaretDown, CaretRight, Download } from '@phosphor-icons/react';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Id, toast } from 'react-toastify';
import { encodeFunctionData, formatUnits, getAddress, getContract } from 'viem';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import HatsAccount1ofNAbi from '../../../../../assets/abi/HatsAccount1ofN';
import { SablierV2LockupLinearAbi } from '../../../../../assets/abi/SablierV2LockupLinear';
import { RoleValue, SablierPayment } from '../../../../../components/pages/Roles/types';
import { convertStreamIdToBigInt } from '../../../../../hooks/streams/useCreateSablierStream';
import { DecentRoleHat } from '../../../../../store/roles';

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
  roleHat: DecentRoleHat | RoleValue;
}) {
  const { address: account } = useAccount();
  const { t } = useTranslation(['roles', 'common']);
  const [withdrawableAmount, setWithdrawableAmount] = useState(0n);

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

      const newWithdrawableAmount = await streamContract.read.withdrawableAmountOf([
        bigintStreamId,
      ]);

      setWithdrawableAmount(newWithdrawableAmount);
    }
  }, [walletClient, payment?.streamId, payment?.contractAddress]);

  useEffect(() => {
    loadAmounts();
  }, [loadAmounts]);

  const handleWithdraw = useCallback(async () => {
    if (payment?.contractAddress && payment?.streamId && walletClient && publicClient) {
      let withdrawToast: Id | undefined = undefined;
      try {
        const hatsAccountContract = getContract({
          abi: HatsAccount1ofNAbi,
          address: roleHat.smartAddress,
          client: walletClient,
        });
        const bigIntStreamId = convertStreamIdToBigInt(payment.streamId);
        let hatsAccountCalldata = encodeFunctionData({
          abi: SablierV2LockupLinearAbi,
          functionName: 'withdrawMax',
          args: [bigIntStreamId, getAddress(roleHat.wearer)],
        });
        withdrawToast = toast(t('withdrawPendingMessage'), {
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
          toast(t('withdrawSuccessMessage'));
        } else {
          toast(t('withdrawRevertedMessage'));
        }
      } catch (e) {
        if (withdrawToast !== undefined) {
          toast.dismiss(withdrawToast);
        }
        console.error('Error withdrawing from stream', e);
        toast(t('withdrawErrorMessage'));
      }
    }
  }, [
    payment?.contractAddress,
    payment?.streamId,
    publicClient,
    walletClient,
    roleHat.smartAddress,
    roleHat.wearer,
    loadAmounts,
    t,
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
                    <Button
                      w="full"
                      leftIcon={<Download />}
                      onClick={handleWithdraw}
                      disabled={withdrawableAmount <= 0n}
                    >
                      {t('withdraw')}
                    </Button>
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
