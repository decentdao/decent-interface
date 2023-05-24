import { Portal, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddSignerModal from '../../pages/ManageSigners/AddSignerModal';
import RemoveSignerModal from '../../pages/ManageSigners/RemoveSignerModal';
import { ConfirmModifyGovernanceModal } from './ConfirmModifyGovernanceModal';
import { ConfirmUrlModal } from './ConfirmUrlModal';
import { DelegateModal } from './DelegateModal';
import { ModalBase } from './ModalBase';
import ProposalTemplateModal from './ProposalTemplateModal';
import { SendAssetsModal } from './SendAssetsModal';
import { UnwrapToken } from './UnwrapToken';
import { WrapToken } from './WrapToken';

export enum ModalType {
  NONE,
  DELEGATE,
  SEND_ASSETS,
  WRAP_TOKEN,
  UNWRAP_TOKEN,
  CONFIRM_URL,
  REMOVE_SIGNER,
  ADD_SIGNER,
  CREATE_PROPOSAL_FROM_TEMPLATE,
  CONFIRM_MODIFY_GOVERNANCE,
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

  const { title, warn, content, onSetClosed } = useMemo<ModalUI>(() => {
    const cl = () => {
      setCurrent({ type: ModalType.NONE, props: [] });
      onClose();
    };
    let ti;
    let wa = false;
    let co;
    switch (current.type) {
      case ModalType.DELEGATE:
        ti = t('delegateTitle');
        co = <DelegateModal close={cl} />;
        break;
      case ModalType.SEND_ASSETS:
        ti = t('sendAssetsTitle');
        co = <SendAssetsModal close={cl} />;
        break;
      case ModalType.WRAP_TOKEN:
        // @todo add title to translations
        ti = t('wrapTokenTitle');
        co = <WrapToken close={cl} />;
        break;
      case ModalType.UNWRAP_TOKEN:
        // @todo add title to translations
        ti = t('unwrapTokenTitle');
        co = <UnwrapToken close={cl} />;
        break;
      case ModalType.CONFIRM_URL:
        ti = t('confirmUrlTitle');
        wa = true;
        co = (
          <ConfirmUrlModal
            url={current.props.url}
            close={cl}
          />
        );
        break;
      case ModalType.REMOVE_SIGNER:
        ti = t('removeSignerTitle');
        co = (
          <RemoveSignerModal
            selectedSigner={current.props.selectedSigner}
            signers={current.props.signers}
            currentThreshold={current.props.currentThreshold}
            close={cl}
          />
        );
        break;
      case ModalType.ADD_SIGNER:
        ti = t('addSignerTitle');
        co = (
          <AddSignerModal
            signers={current.props.signers}
            currentThreshold={current.props.currentThreshold}
            close={cl}
          />
        );
        break;
      case ModalType.CREATE_PROPOSAL_FROM_TEMPLATE:
        ti = current.props.proposalTemplate.title;
        co = (
          <ProposalTemplateModal
            proposalTemplate={current.props.proposalTemplate}
            onClose={cl}
          />
        );
        break;
      case ModalType.CONFIRM_MODIFY_GOVERNANCE:
        wa = true;
        ti = t('confirmModifyGovernanceTitle');
        co = <ConfirmModifyGovernanceModal close={cl} />;
        break;
      case ModalType.NONE:
      default:
        ti = '';
        co = null;
    }
    return { title: ti, warn: wa, content: co, onSetClosed: cl };
  }, [current, onClose, t]);

  const display = content ? (
    <ModalBase
      title={title}
      warn={warn}
      isOpen={isOpen}
      onClose={onSetClosed}
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
