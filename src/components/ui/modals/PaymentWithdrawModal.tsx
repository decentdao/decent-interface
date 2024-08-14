import { Box, Button, Flex, Image, Text, useBreakpointValue } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Id, toast } from 'react-toastify';
import { encodeFunctionData, getAddress, getContract } from 'viem';
import { usePublicClient, useWalletClient } from 'wagmi';
import HatsAccount1ofNAbi from '../../../assets/abi/HatsAccount1ofN';
import { SablierV2LockupLinearAbi } from '../../../assets/abi/SablierV2LockupLinear';
import { SEXY_BOX_SHADOW_T_T } from '../../../constants/common';
import { convertStreamIdToBigInt } from '../../../hooks/streams/useCreateSablierStream';
import useAvatar from '../../../hooks/utils/useAvatar';
import useDisplayName from '../../../hooks/utils/useDisplayName';
import { useNetworkConfig } from '../../../providers/NetworkConfig/NetworkConfigProvider';
import { DecentRoleHat } from '../../../store/roles';
import { formatCoin } from '../../../utils';
import { RoleValue, SablierPayment } from '../../pages/Roles/types';
import Avatar, { AvatarSize } from '../page/Header/Avatar';

export default function PaymentWithdrawModal({
  payment,
  roleHat,
  onSuccess,
  onClose,
  withdrawableAmount,
}: {
  payment: SablierPayment;
  roleHat: DecentRoleHat | RoleValue;
  onSuccess: () => Promise<void>;
  onClose: () => void;
  withdrawableAmount: bigint;
}) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { t } = useTranslation('roles');
  const { displayName: accountDisplayName } = useDisplayName(roleHat.wearer);
  const avatarURL = useAvatar(accountDisplayName);
  const iconSize = useBreakpointValue<AvatarSize>({ base: 'sm', md: 'icon' }) || 'sm';
  const { chain } = useNetworkConfig();

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
          await onSuccess();
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
    onSuccess,
    t,
  ]);

  return (
    <Flex gap="1rem">
      <Flex
        py="1rem"
        gap="1rem"
        borderRadius="0.5rem"
        boxShadow={SEXY_BOX_SHADOW_T_T}
        bg="neutral-2"
      >
        <Flex
          w="50%"
          gap="0.5rem"
          alignItems="center"
          px="1rem"
        >
          <Image
            src={payment.asset.logo}
            fallbackSrc="/images/coin-icon-default.svg"
            alt={payment.asset.symbol}
            w="2rem"
            h="2rem"
          />
          <Text textStyle="label-large">{payment.asset.symbol}</Text>
        </Flex>
        <Flex
          w="50%"
          flexWrap="wrap"
          px="1rem"
          alignItems="center"
        >
          <Text
            textStyle="label-small"
            color="neutral-7"
          >
            {t('available')}
          </Text>
          <Text textStyle="display-4xl">
            {formatCoin(withdrawableAmount, true, payment.asset.decimals, undefined, false)}
          </Text>
        </Flex>
      </Flex>
      <Box>
        <Flex gap="0.5rem">
          <Text textStyle="label-small">{t('withdrawTo')}</Text>
          <Flex
            alignItems="center"
            gap={{ base: '0.25rem', md: '0.75rem' }}
          >
            <Box>
              <Avatar
                address={roleHat.wearer}
                url={avatarURL}
                size={iconSize}
              />
            </Box>
            <Text
              textStyle={{ base: 'label-small', md: 'button-base' }}
              mb="1px"
            >
              {accountDisplayName}
            </Text>
          </Flex>
        </Flex>
        <Flex gap="0.5rem">
          <Text
            textStyle="label-small"
            color="neutral-7"
          >
            {t('network', { ns: 'menu' })}
          </Text>
          <Text>{chain.name}</Text>
        </Flex>
      </Box>
      <Flex gap="0.75rem">
        <Button
          size="md"
          onClick={onClose}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          size="md"
          onClick={handleWithdraw}
        >
          {t('withdraw')}
        </Button>
      </Flex>
    </Flex>
  );
}
