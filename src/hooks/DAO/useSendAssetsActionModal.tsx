import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ModalType } from '../../components/ui/modals/ModalProvider';
import { useDecentModal } from '../../components/ui/modals/useDecentModal';
import { DAO_ROUTES } from '../../constants/routes';
import { useFractal } from '../../providers/App/AppProvider';
import { useNetworkConfigStore } from '../../providers/NetworkConfig/useNetworkConfigStore';
import { useProposalActionsStore } from '../../store/actions/useProposalActionsStore';
import { useDaoInfoStore } from '../../store/daoInfo/useDaoInfoStore';
import { ProposalActionType } from '../../types/proposalBuilder';
import { formatCoin } from '../../utils';
import {
  prepareSendAssetsActionData,
  SendAssetsData,
} from '../../utils/dao/prepareSendAssetsActionData';

export default function useSendAssetsActionModal() {
  const { safe } = useDaoInfoStore();
  const { addressPrefix, nativeAssetAddress } = useNetworkConfigStore();
  const { t } = useTranslation(['modals']);
  const { addAction } = useProposalActionsStore();
  const navigate = useNavigate();
  const {
    governance: { isAzorius },
  } = useFractal();
  const sendAssetsAction = async (sendAssetsData: SendAssetsData) => {
    if (!safe?.address) {
      return;
    }

    const { tokenAddress, transferAmount } = prepareSendAssetsActionData(
      sendAssetsData,
      nativeAssetAddress,
    );

    const isNativeTransfer = tokenAddress === null;

    const formattedNativeTokenValue = formatCoin(
      transferAmount,
      true,
      sendAssetsData.asset.decimals,
      sendAssetsData.asset.symbol,
      false,
    );

    // Don't transfer native tokens if this is not a native token transfer.
    // Amount to transfer will be the 2nd parameter of the transfer function.
    const ethValue = isNativeTransfer
      ? {
          bigintValue: transferAmount,
          value: formattedNativeTokenValue,
        }
      : { bigintValue: 0n, value: '0' };

    // If the transfer is a native token transfer, we use the destination address as the target address
    // Otherwise, the target is the token address, on which transfer function is called
    const targetAddress = isNativeTransfer ? sendAssetsData.recipientAddress : tokenAddress;

    addAction({
      actionType: ProposalActionType.TRANSFER,
      content: <></>,
      transactions: [
        {
          targetAddress,
          ethValue,
          functionName: isNativeTransfer ? '' : 'transfer',
          parameters: isNativeTransfer
            ? []
            : [
                { signature: 'address', value: sendAssetsData.recipientAddress },
                { signature: 'uint256', value: sendAssetsData.transferAmount.toString() },
              ],
        },
      ],
    });

    navigate(DAO_ROUTES.proposalWithActionsNew.relative(addressPrefix, safe.address));
  };

  const openSendAssetsModal = useDecentModal(ModalType.SEND_ASSETS, {
    onSubmit: sendAssetsAction,
    submitButtonText: t('submitProposal', { ns: 'modals' }),
    showNonceInput: !isAzorius,
  });

  return {
    openSendAssetsModal,
  };
}
