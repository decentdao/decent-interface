import { Portal, useDisclosure } from '@chakra-ui/react';
import { createContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AddSignerModal from '../../pages/ManageSigners/AddSignerModal';
import RemoveSignerModal from '../../pages/ManageSigners/RemoveSignerModal';
import { ConfirmUrlModal } from './ConfirmUrlModal';
import { DelegateModal } from './DelegateModal';
import { ModalBase } from './ModalBase';
import { SendAssetsModal } from './SendAssetsModal';

export enum ModalType {
  NONE,
  DELEGATE,
  SEND_ASSETS,
  CONFIRM_URL,
  REMOVE_SIGNER,
  ADD_SIGNER,
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
        ti = 'Remove Signer';
        co = (
          <RemoveSignerModal
            selectedSigner={current.props.selectedSigner}
            signers={current.props.signers}
            close={cl}
          />
        );
        break;
      case ModalType.ADD_SIGNER:
        ti = 'Add Signer';
        co = (
          <AddSignerModal
            signerCount={current.props.signerCount}
            close={cl}
          />
        );
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
