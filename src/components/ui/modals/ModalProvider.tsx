import { Portal, Show, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Address } from 'viem';
import { UnsavedChangesWarningContent } from '../../../pages/daos/[daoAddress]/roles/edit/unsavedChangesWarningContent';
import { ProposalTemplate } from '../../../types';
import AddSignerModal from '../../pages/DaoSettings/components/Signers/modals/AddSignerModal';
import RemoveSignerModal from '../../pages/DaoSettings/components/Signers/modals/RemoveSignerModal';
import DraggableDrawer from '../containers/DraggableDrawer';
import { DAOSearch } from '../menus/DAOSearch';
import { ConfirmModifyGovernanceModal } from './ConfirmModifyGovernanceModal';
import { ConfirmUrlModal } from './ConfirmUrlModal';
import { DelegateModal } from './DelegateModal';
import ForkProposalTemplateModal from './ForkProposalTemplateModal';
import { ModalBase, ModalBaseSize } from './ModalBase';
import PaymentCancelConfirmModal from './PaymentCancelConfirmModal';
import PaymentWithdrawModal from './PaymentWithdrawModal';
import ProposalTemplateModal from './ProposalTemplateModal';
import StakeModal from './Stake';
import { UnwrapToken } from './UnwrapToken';
import { WrapToken } from './WrapToken';

export enum ModalType {
  NONE,
  DELEGATE,
  STAKE,
  WRAP_TOKEN,
  UNWRAP_TOKEN,
  CONFIRM_URL,
  REMOVE_SIGNER,
  ADD_SIGNER,
  CREATE_PROPOSAL_FROM_TEMPLATE,
  COPY_PROPOSAL_TEMPLATE,
  CONFIRM_MODIFY_GOVERNANCE,
  SEARCH_SAFE,
  WARN_UNSAVED_CHANGES,
  WITHDRAW_PAYMENT,
  CONFIRM_CANCEL_PAYMENT,
}

export type CurrentModal = {
  [K in ModalType]: { type: K; props: ModalPropsTypes[K] };
}[ModalType];

export type ModalPropsTypes = {
  [ModalType.NONE]: {};
  [ModalType.DELEGATE]: {};
  [ModalType.STAKE]: {};
  [ModalType.WRAP_TOKEN]: {};
  [ModalType.UNWRAP_TOKEN]: {};
  [ModalType.CONFIRM_URL]: { url: string };
  [ModalType.REMOVE_SIGNER]: {
    selectedSigner: Address;
    signers: Address[];
    currentThreshold: number;
  };
  [ModalType.ADD_SIGNER]: { signers: Address[]; currentThreshold: number };
  [ModalType.CREATE_PROPOSAL_FROM_TEMPLATE]: { proposalTemplate: ProposalTemplate };
  [ModalType.COPY_PROPOSAL_TEMPLATE]: {
    proposalTemplate: ProposalTemplate;
    templateIndex: number;
  };
  [ModalType.CONFIRM_MODIFY_GOVERNANCE]: {};
  [ModalType.SEARCH_SAFE]: {};
  [ModalType.WARN_UNSAVED_CHANGES]: {
    discardChanges: () => void;
    keepEditing: () => void;
  };
  [ModalType.WITHDRAW_PAYMENT]: {
    paymentAssetLogo?: string;
    paymentAssetSymbol: string;
    paymentAssetDecimals: number;
    paymentStreamId?: string;
    paymentContractAddress: Address;
    withdrawInformation: {
      roleHatSmartAccountAddress: Address | undefined;
      recipient: Address;
      withdrawableAmount: bigint;
    };
    onSuccess: () => Promise<void>;
  };
  [ModalType.CONFIRM_CANCEL_PAYMENT]: {
    onSubmit: () => void;
  };
};

export interface IModalContext {
  current: CurrentModal;
  setCurrent: (modal: CurrentModal) => void;
}

export const ModalContext = createContext<IModalContext>({
  current: { type: ModalType.NONE, props: {} },
  setCurrent: () => {},
});

interface ModalUI {
  title: string;
  warn: boolean;
  content: ReactNode | null;
  isSearchInputModal: boolean;
  onSetClosed: () => void;
  size: ModalBaseSize;
}

/**
 * A provider that handles displaying modals in the app.
 *
 * To add a new modal:
 *  1. Create the modal content as a component, excluding the title of the modal (see e.g. DelegateModal).
 *  2. Add the modal to the ModalType enum.
 *  3. Handle assigning your new modal component for that ModalType here in the provider switch case.
 *  4. Utilize the useDecentModal hook to get a click listener to open your new modal.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentModal>({
    type: ModalType.NONE,
    props: {},
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('modals');

  useEffect(() => {
    if (current.type != ModalType.NONE) onOpen();
  }, [current.type, onOpen]);

  const { title, warn, content, onSetClosed, isSearchInputModal, size } = useMemo<ModalUI>(() => {
    const closeModal = () => {
      setCurrent({ type: ModalType.NONE, props: {} });
      onClose();
    };

    let modalSize: ModalBaseSize = 'lg';
    let modalTitle: string | undefined;
    let hasWarning = false;
    let isSearchInput = false;
    let modalContent: ReactNode | null = null;

    switch (current.type) {
      case ModalType.DELEGATE:
        modalTitle = t('delegateTitle');
        modalContent = <DelegateModal close={closeModal} />;
        break;
      case ModalType.STAKE:
        modalTitle = t('stakeTitle');
        modalContent = <StakeModal close={closeModal} />;
        break;
      case ModalType.WRAP_TOKEN:
        modalTitle = t('wrapTokenTitle');
        modalContent = <WrapToken close={closeModal} />;
        break;
      case ModalType.UNWRAP_TOKEN:
        modalTitle = t('unwrapTokenTitle');
        modalContent = <UnwrapToken close={closeModal} />;
        break;
      case ModalType.CONFIRM_URL:
        modalTitle = t('confirmUrlTitle');
        hasWarning = true;
        modalContent = (
          <ConfirmUrlModal
            url={current.props.url}
            close={closeModal}
          />
        );
        break;
      case ModalType.REMOVE_SIGNER:
        modalTitle = t('removeSignerTitle');
        modalContent = (
          <RemoveSignerModal
            selectedSigner={current.props.selectedSigner}
            signers={current.props.signers}
            currentThreshold={current.props.currentThreshold}
            close={closeModal}
          />
        );
        break;
      case ModalType.ADD_SIGNER:
        modalTitle = t('addSignerTitle');
        modalContent = (
          <AddSignerModal
            signers={current.props.signers}
            currentThreshold={current.props.currentThreshold}
            close={closeModal}
          />
        );
        break;
      case ModalType.CREATE_PROPOSAL_FROM_TEMPLATE:
        modalTitle = current.props.proposalTemplate.title;
        modalContent = (
          <ProposalTemplateModal
            proposalTemplate={current.props.proposalTemplate}
            onClose={closeModal}
          />
        );
        break;
      case ModalType.COPY_PROPOSAL_TEMPLATE:
        modalTitle = t('forkProposalTemplate');
        modalContent = (
          <ForkProposalTemplateModal
            proposalTemplate={current.props.proposalTemplate}
            templateIndex={current.props.templateIndex}
            onClose={closeModal}
          />
        );
        break;
      case ModalType.CONFIRM_MODIFY_GOVERNANCE:
        hasWarning = true;
        modalTitle = t('confirmModifyGovernanceTitle');
        modalContent = <ConfirmModifyGovernanceModal close={closeModal} />;
        break;
      case ModalType.SEARCH_SAFE:
        isSearchInput = true;
        modalContent = <DAOSearch closeDrawer={closeModal} />;
        break;
      case ModalType.WARN_UNSAVED_CHANGES:
        modalContent = (
          <UnsavedChangesWarningContent
            onDiscard={() => {
              current.props.discardChanges();
              closeModal();
            }}
            onKeepEditing={() => {
              current.props.keepEditing();
              closeModal();
            }}
          />
        );
        break;
      case ModalType.WITHDRAW_PAYMENT: {
        modalContent = (
          <PaymentWithdrawModal
            paymentAssetLogo={current.props.paymentAssetLogo}
            paymentAssetSymbol={current.props.paymentAssetSymbol}
            paymentAssetDecimals={current.props.paymentAssetDecimals}
            paymentStreamId={current.props.paymentStreamId}
            paymentContractAddress={current.props.paymentContractAddress}
            withdrawInformation={current.props.withdrawInformation}
            onSuccess={current.props.onSuccess}
            onClose={closeModal}
          />
        );
        break;
      }
      case ModalType.CONFIRM_CANCEL_PAYMENT: {
        modalContent = (
          <PaymentCancelConfirmModal
            onClose={closeModal}
            onSubmit={current.props.onSubmit}
          />
        );
        modalSize = 'sm';
        break;
      }
      case ModalType.NONE:
      default:
        modalTitle = '';
        modalContent = null;
    }

    return {
      isSearchInputModal: isSearchInput,
      title: modalTitle || '',
      warn: hasWarning,
      content: modalContent,
      onSetClosed: closeModal,
      size: modalSize,
    };
  }, [current, onClose, t]);

  let display = content ? (
    <ModalBase
      title={title}
      warn={warn}
      isOpen={isOpen}
      onClose={onSetClosed}
      isSearchInputModal={isSearchInputModal}
      size={size}
    >
      {content}
    </ModalBase>
  ) : null;

  if (
    current.type === ModalType.WITHDRAW_PAYMENT ||
    current.type === ModalType.CONFIRM_CANCEL_PAYMENT
  ) {
    display = (
      <>
        <Show below="md">
          <DraggableDrawer
            isOpen={isOpen}
            onClose={onSetClosed}
            onOpen={onOpen}
            closeOnOverlayClick
            headerContent={null}
          >
            {content}
          </DraggableDrawer>
        </Show>
        <Show above="md">
          <ModalBase
            title={title}
            warn={warn}
            isOpen={isOpen}
            onClose={onSetClosed}
            isSearchInputModal={isSearchInputModal}
            zIndex={1401} // @dev - Modal zIndex is 1400, but since these modals are might be shown alongside drawer - we need to make it larger
            size={size}
          >
            {content}
          </ModalBase>
        </Show>
      </>
    );
  }

  return (
    <ModalContext.Provider value={{ current, setCurrent }}>
      {children}
      <Portal>{display}</Portal>
    </ModalContext.Provider>
  );
}
