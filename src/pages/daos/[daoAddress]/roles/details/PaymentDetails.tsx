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
import { getContract } from 'viem';
import { useAccount, useWalletClient } from 'wagmi';
import { SablierV2LockupLinearAbi } from '../../../../../assets/abi/SablierV2LockupLinear';
import { RoleValue, SablierPayment } from '../../../../../components/pages/Roles/types';
import { ModalType } from '../../../../../components/ui/modals/ModalProvider';
import { useDecentModal } from '../../../../../components/ui/modals/useDecentModal';
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

  const withdraw = useDecentModal(ModalType.WITHDRAW_PAYMENT, {
    payment,
    roleHat,
    onSuccess: loadAmounts,
    withdrawableAmount,
  });

  useEffect(() => {
    loadAmounts();
  }, [loadAmounts]);

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
                  <Button
                    w="full"
                    leftIcon={<Download />}
                    onClick={withdraw}
                    disabled={withdrawableAmount <= 0n}
                  >
                    {t('withdraw')}
                  </Button>
                )}
              </AccordionPanel>
            </>
          );
        }}
      </AccordionItem>
    </Accordion>
  );
}
