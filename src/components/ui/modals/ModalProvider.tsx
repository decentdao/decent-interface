import { Portal, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddSignerModal from '../../pages/DaoSettings/components/Signers/modals/AddSignerModal';
import RemoveSignerModal from '../../pages/DaoSettings/components/Signers/modals/RemoveSignerModal';
import { DAOSearch } from '../menus/DAOSearch';
import { ConfirmModifyGovernanceModal } from './ConfirmModifyGovernanceModal';
import { ConfirmUrlModal } from './ConfirmUrlModal';
import { DelegateModal } from './DelegateModal';
import ForkProposalTemplateModal from './ForkProposalTemplateModal';
import { ModalBase } from './ModalBase';
import ProposalTemplateModal from './ProposalTemplateModal';
import { SendAssetsModal } from './SendAssetsModal';
import StakeModal from './Stake';
import { UnwrapToken } from './UnwrapToken';
import { WrapToken } from './WrapToken';

export enum ModalType {
  NONE,
  DELEGATE,
  SEND_ASSETS,
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
}

export interface CurrentModal {
  type: ModalType;
  props: Record<string, any>;
}

export interface IModalContext {
  current: CurrentModal;
  setCurrent: Function;
}

export const ModalContext = createContext<IModalContext>({
  current: { type: ModalType.NONE, props: [] },
  setCurrent: () => {},
});

interface ModalUI {
  title: string;
  warn: boolean;
  content: ReactNode | null;
  isFullscreen: boolean;
  onSetClosed: () => void;
}
/**
 * A provider that handles displaying modals in the app.
 *
 * To add a new modal:
 *  1. Create the modal content as a component, excluding the title of the modal (see e.g. DelegateModal).
 *  2. Add the modal to the ModalType enum.
 *  3. Handle assigning your new modal component for that ModalType here in the provider switch case.
 *  4. Utilize the useFractalModal hook to get a click listener to open your new modal.
 */
export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<CurrentModal>({ type: ModalType.NONE, props: [] });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation('modals');

  useEffect(() => {
    if (current.type != ModalType.NONE) onOpen();
  });

  const { title, warn, content, onSetClosed, isFullscreen } = useMemo<ModalUI>(() => {
    const closeModal = () => {
      setCurrent({ type: ModalType.NONE, props: [] });
      onClose();
    };

    let modalTitle;
    let isWarn = false;
    let isModalFullscreen = false;
    let modalContent;

    switch (current.type) {
      case ModalType.DELEGATE:
        modalTitle = t('delegateTitle');
        modalContent = <DelegateModal close={closeModal} />;
        break;
      case ModalType.SEND_ASSETS:
        modalTitle = t('sendAssetsTitle');
        modalContent = <SendAssetsModal close={closeModal} />;
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
        isWarn = true;
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
        isWarn = true;
        modalTitle = t('confirmModifyGovernanceTitle');
        modalContent = <ConfirmModifyGovernanceModal close={closeModal} />;
        break;
      case ModalType.SEARCH_SAFE:
        isModalFullscreen = true;
        modalContent = <DAOSearch closeDrawer={closeModal} />;
        break;
      case ModalType.NONE:
      default:
        modalTitle = '';
        modalContent = null;
    }

    return {
      isFullscreen: isModalFullscreen,
      title: modalTitle,
      warn: isWarn,
      content: modalContent,
      onSetClosed: closeModal,
    };
  }, [current, onClose, t]);

  const display = content ? (
    <ModalBase
      title={title}
      warn={warn}
      isOpen={isOpen}
      onClose={onSetClosed}
      isFullscreen={isFullscreen}
    >
      {content}
    </ModalBase>
  ) : null;

  return (
    <ModalContext.Provider value={{ current, setCurrent }}>
      {children}
      <Portal>{display}</Portal>
    </ModalContext.Provider>
  );
}
